"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Level } from "@/generated/prisma/enums";
import {
  chatCompletion,
  extractJson,
  LlmError,
} from "@/lib/teacher/client";
import {
  getEnvApiKey,
  maskApiKey,
  type LlmProviderId,
} from "@/lib/teacher/providers";
import { encryptApiKey, decryptApiKey } from "@/lib/teacher/crypto";
import { getTeacherSystemPrompt } from "@/lib/teacher/prompt";
import {
  teacherFeedbackSchema,
  teacherQuestSchema,
  feedbackInputSchema,
  type TeacherFeedback,
} from "@/lib/teacher/types";
import { findNextCatalogQuest, getCatalogQuest } from "@/lib/teacher/catalog";
import type { CEFRLevel } from "@/types";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

const LLM_RATE_LIMIT = { windowMs: 60_000, maxRequests: 20 };

async function getAuthUserId() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user.id;
}

function calculateSimilarity(a: string, b: string): number {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^\w\sáàâãéèêíìîóòôõúùûç]/g, "").trim();
  const tokensA = norm(a).split(/\s+/).filter(Boolean);
  const tokensB = norm(b).split(/\s+/).filter(Boolean);
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setB = new Set(tokensB);
  const matched = tokensA.filter((t) => setB.has(t)).length;
  return Math.round((matched / Math.max(tokensA.length, tokensB.length)) * 100);
}

export interface ResolvedLlm {
  provider: LlmProviderId;
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

async function resolveUserLlm(
  userId: string,
): Promise<ResolvedLlm | null> {
  const settings = await prisma.llmSettings.findUnique({
    where: { userId },
  });

  if (settings?.apiKeyEncrypted) {
    try {
      return {
        provider: settings.provider as LlmProviderId,
        apiKey: decryptApiKey(settings.apiKeyEncrypted),
        model: settings.model ?? undefined,
        baseUrl: settings.baseUrl ?? undefined,
      };
    } catch {
      // chave indecifrável → cai no fallback de env
    }
  }

  const provider = (settings?.provider ?? "nvidia") as LlmProviderId;
  const envKey = getEnvApiKey(provider);
  if (envKey) {
    return {
      provider,
      apiKey: envKey,
      model: settings?.model ?? undefined,
      baseUrl: settings?.baseUrl ?? undefined,
    };
  }

  return null;
}

const saveSettingsSchema = z.object({
  provider: z.enum(["nvidia", "openrouter", "groq", "custom"]),
  model: z.string().max(120).optional(),
  apiKey: z.string().max(200).optional(),
  baseUrl: z.string().url().max(200).optional(),
});

export async function getLlmSettings() {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const settings = await prisma.llmSettings.findUnique({
    where: { userId },
  });

  const provider = (settings?.provider ?? "nvidia") as LlmProviderId;
  const envKey = getEnvApiKey(provider);

  return {
    provider,
    model: settings?.model ?? null,
    baseUrl: settings?.baseUrl ?? null,
    apiKeyMasked: settings?.apiKeyEncrypted
      ? maskApiKey(decryptSafe(settings.apiKeyEncrypted))
      : null,
    envConfigured: Boolean(envKey),
  };
}

function decryptSafe(payload: string): string {
  try {
    return decryptApiKey(payload);
  } catch {
    return "";
  }
}

export async function saveLlmSettings(input: {
  provider: LlmProviderId;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
}) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  const parsed = saveSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos" as const };
  }
  const { provider, model, apiKey, baseUrl } = parsed.data;

  if (!checkRateLimit(getRateLimitKey(userId, "llm-settings"), {
    windowMs: 60_000,
    maxRequests: 10,
  }).allowed) {
    return { error: "Muitas tentativas. Aguarde um minuto." as const };
  }

  const existing = await prisma.llmSettings.findUnique({
    where: { userId },
  });

  const data: {
    provider: string;
    model: string | null;
    baseUrl: string | null;
    apiKeyEncrypted?: string;
  } = {
    provider,
    model: model || null,
    baseUrl: baseUrl || null,
  };

  if (apiKey && apiKey.trim().length > 0) {
    try {
      data.apiKeyEncrypted = encryptApiKey(apiKey.trim());
    } catch {
      return { error: "Falha ao proteger a chave" as const };
    }
  } else if (!existing?.apiKeyEncrypted) {
    data.apiKeyEncrypted = "";
  }

  const settings = await prisma.llmSettings.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      provider,
      model: model || null,
      baseUrl: baseUrl || null,
      apiKeyEncrypted: data.apiKeyEncrypted,
    },
  });

  return {
    provider: settings.provider,
    model: settings.model,
    baseUrl: settings.baseUrl,
    apiKeyMasked: settings.apiKeyEncrypted
      ? maskApiKey(decryptSafe(settings.apiKeyEncrypted))
      : null,
  };
}

export async function testLlmConnection() {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  if (!checkRateLimit(getRateLimitKey(userId, "llm-test"), {
    windowMs: 60_000,
    maxRequests: 10,
  }).allowed) {
    return { error: "Muitas tentativas. Aguarde um minuto." as const };
  }

  const llm = await resolveUserLlm(userId);
  if (!llm) {
    return {
      error:
        "Nenhuma chave de API configurada. Configure no jogo ou use uma variável de ambiente.",
    } as const;
  }

  try {
    const result = await chatCompletion({
      provider: llm.provider,
      apiKey: llm.apiKey,
      model: llm.model,
      baseUrl: llm.baseUrl,
      system: "Você é um assistente de teste. Responda apenas: OK",
      user: "ping",
      maxTokens: 16,
      temperature: 0,
    });
    return { ok: true, model: result.model } as const;
  } catch (err) {
    const message =
      err instanceof LlmError ? err.message : "Falha inesperada";
    return { error: message } as const;
  }
}

export async function getActiveTeacherQuest() {
  const userId = await getAuthUserId();
  if (!userId) return null;

  const quest = await prisma.aiQuest.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
  return quest;
}

export async function startCatalogQuest() {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  if (
    !checkRateLimit(getRateLimitKey(userId, "catalog-quest"), {
      windowMs: 60_000,
      maxRequests: 10,
    }).allowed
  ) {
    return { error: "Muitas missões por minuto. Aguarde um pouco." as const };
  }

  const existing = await prisma.aiQuest.findFirst({
    where: { userId, status: "ACTIVE", catalogId: { not: null } },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return { quest: existing };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const cefr: CEFRLevel = user
    ? (estimatedCefrFromLevel(user.level) as CEFRLevel)
    : "A1";

  const completed = await prisma.aiQuest.findMany({
    where: { userId, status: "COMPLETED", catalogId: { not: null } },
    select: { catalogId: true },
  });
  const completedIds = new Set(
    completed
      .map((row) => row.catalogId)
      .filter((id): id is string => id !== null),
  );

  const quest = findNextCatalogQuest(cefr, completedIds);
  if (!quest) {
    return {
      error: "Você já concluiu todas as missões prontas! Use o gerador de IA.",
    } as const;
  }

  const saved = await prisma.aiQuest.create({
    data: {
      userId,
      questTitle: quest.quest_title,
      cefrLevel: quest.cefr_level as Level,
      theme: quest.theme,
      narrativeHook: quest.narrative_hook,
      newStructure: quest.new_structure,
      challengePrompt: quest.challenge_prompt,
      hintProgressive: quest.hint_progressive,
      xpBase: quest.xp_base,
      lootPool: quest.loot_pool,
      streakMultiplierEligible: quest.streak_multiplier_eligible,
      catalogId: quest.id,
    },
  });

  return { quest: saved };
}

function estimatedCefrFromLevel(level: number): string {
  if (level <= 3) return "A1";
  if (level <= 6) return "A2";
  if (level <= 9) return "B1";
  if (level <= 12) return "B2";
  if (level <= 15) return "C1";
  return "C2";
}

async function buildQuestUserMessage(): Promise<string> {
  const userId = await getAuthUserId();
  let profile = "Jogador novo, sem perfil completo ainda.";
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      profile = [
        `- Nível de jogo: ${user.level}`,
        `- Nível CEFR estimado: ${estimatedCefrFromLevel(user.level)}`,
        `- Classe: ${user.class ?? "Adventurer"}`,
        `- Interesses: ${(user.interests ?? []).join(", ") || "não definidos"}`,
        `- Streak atual: ${user.streak} dias`,
      ].join("\n");
    }
  }

  return `Gere UMA quest de inglês nova e original. Use o perfil do jogador abaixo.

PERFIL DO JOGADOR:
${profile}

REGRAS:
- Saia do tema padrão: evite repetir exercícios genéricos de escola.
- Use o universo preferido do jogador (séries, tech, negócios, viagem, games) como cenário.
- Apenas UMA estrutura gramatical nova ou 3-5 palavras novas.
- Desafio de PRODUÇÃO (escrever/responder/traduzir), nunca múltipla escolha.
- Nível CEFR de acordo com o perfil (i+1: um degrau acima do confortável).
- Todos os textos visíveis na UI devem estar em PORTUGUÊS (pt-BR), exceto o inglês dentro do desafio.
- xp_base entre 40 e 120.
- 2 a 4 pistas progressivas.
- hint_progressive e loot_pool devem ser arrays, mesmo vazios.
- loot_pool: use raridades ("comum", "raro", "epico", "lendario") OU nomes de itens temáticos (ex: "Adaga da Clareza").
- Responda APENAS com um objeto JSON válido, sem markdown e sem texto extra, no formato exato:

{
  "quest_title": string,
  "cefr_level": "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
  "theme": string,
  "narrative_hook": string,
  "new_structure": string,
  "challenge_prompt": string,
  "hint_progressive": string[],
  "xp_base": number,
  "loot_pool": string[],
  "streak_multiplier_eligible": boolean
}`;
}

export async function generateTeacherQuest() {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  if (
    !checkRateLimit(getRateLimitKey(userId, "llm-generate"), LLM_RATE_LIMIT)
      .allowed
  ) {
    return { error: "Muitas gerações por minuto. Aguarde um pouco." as const };
  }

  const llm = await resolveUserLlm(userId);
  if (!llm) {
    return { error: "Configure uma chave de API na página de Configurações." as const };
  }

  try {
    const system = await getTeacherSystemPrompt();
    const user = await buildQuestUserMessage();
    const result = await chatCompletion({
      provider: llm.provider,
      apiKey: llm.apiKey,
      model: llm.model,
      baseUrl: llm.baseUrl,
      system,
      user,
      maxTokens: 1200,
      temperature: 0.8,
    });

    const quest = extractJson(result.text, teacherQuestSchema);

    const saved = await prisma.aiQuest.create({
      data: {
        userId,
        questTitle: quest.quest_title,
        cefrLevel: quest.cefr_level as Level,
        theme: quest.theme,
        narrativeHook: quest.narrative_hook,
        newStructure: quest.new_structure,
        challengePrompt: quest.challenge_prompt,
        hintProgressive: quest.hint_progressive,
        xpBase: quest.xp_base,
        lootPool: quest.loot_pool,
        streakMultiplierEligible: quest.streak_multiplier_eligible,
      },
    });

    return { quest: saved };
  } catch (err) {
    const message = err instanceof LlmError ? err.message : "Falha ao gerar quest";
    return { error: message };
  }
}

async function buildFeedbackUserMessage(input: {
  prompt: string;
  attempt: string;
  target?: string;
  attemptCount: number;
}): Promise<string> {
  const { prompt, attempt, target, attemptCount } = input;
  const targetLine = target ? `- Versão nativa esperada (use como referência, não repita literalmente): ${target}` : "";
  return `Avalie a tentativa abaixo de um jogador de inglês (pt-BR).

PERGUNTA:
${prompt}
${targetLine}

TENTATIVA DO JOGADOR (tentativa número ${attemptCount}):
${attempt}

INSTRUÇÕES:
- Valide primeiro: encontre SEMPRE um ponto genuíno para elogiar.
- score: 0-100 da precisão da tentativa.
- Se a tentativa estiver muito longe do esperado, score baixo, mas o elogio continua.
- praise: 1 frase, tom de mestre de RPG, em pt-BR.
- native_version: a versão correta/mais natural do que o jogador deveria produzir, em inglês. Se a tentativa estiver correta, reescreva-a melhor.
- why: explique o porquê do erro em 1 frase curta, em pt-BR. Se acertou, explique por que a versão nativa é melhor.
- hint: UMA pista progressiva em pt-BR para a próxima tentativa.
- mastery: true somente se score >= 80.
- Responda APENAS com um objeto JSON válido, sem markdown:
{
  "score": number,
  "praise": string,
  "native_version": string,
  "why": string,
  "hint": string,
  "mastery": boolean
}`;
}

export async function evaluateAnswer(
  input: z.infer<typeof feedbackInputSchema>,
) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  const parsed = feedbackInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Dados inválidos" as const };
  }

  if (
    !checkRateLimit(getRateLimitKey(userId, "llm-evaluate"), LLM_RATE_LIMIT)
      .allowed
  ) {
    return {
      feedback: localFallback(parsed.data),
      degraded: true,
    };
  }

  const llm = await resolveUserLlm(userId);
  if (!llm) {
    return { feedback: localFallback(parsed.data), degraded: true };
  }

  try {
    const system = await getTeacherSystemPrompt();
    const user = await buildFeedbackUserMessage({
      prompt: parsed.data.prompt,
      attempt: parsed.data.attempt,
      target: parsed.data.target,
      attemptCount: parsed.data.attemptCount ?? 1,
    });

    const result = await chatCompletion({
      provider: llm.provider,
      apiKey: llm.apiKey,
      model: llm.model,
      baseUrl: llm.baseUrl,
      system,
      user,
      maxTokens: 800,
      temperature: 0.5,
    });

    const feedback = extractJson(result.text, teacherFeedbackSchema);
    return { feedback, degraded: false };
  } catch {
    return { feedback: localFallback(parsed.data), degraded: true };
  }
}

function localFallback(input: {
  prompt: string;
  attempt: string;
  target?: string;
}): TeacherFeedback {
  const target = input.target;
  const sim = target
    ? calculateSimilarity(input.attempt, target)
    : input.attempt.trim().length > 3
      ? 60
      : 20;
  const mastery = sim >= 80;
  return {
    score: Math.min(100, Math.max(0, sim)),
    praise: mastery
      ? "Excelente! Você dominou essa missão como um veterano."
      : "Boa tentativa! Você está mais perto do que parece.",
    native_version: target ?? "",
    why: "Compare sua resposta com a versão nativa abaixo para notar a diferença.",
    hint: target
      ? "Tente reformular focando nas palavras-chave da resposta nativa."
      : "Tente incluir mais detalhes e estruturas completas na sua resposta.",
    mastery,
  };
}

export async function submitTeacherQuest(questId: string, attempt: string) {
  const userId = await getAuthUserId();
  if (!userId) return { error: "Não autenticado" as const };

  const quest = await prisma.aiQuest.findFirst({
    where: { id: questId, userId, status: "ACTIVE" },
  });
  if (!quest) return { error: "Quest não encontrada" as const };

  const catalogTarget =
    quest.catalogId
      ? getCatalogQuest(quest.catalogId)?.modelAnswer
      : undefined;

  const result = await evaluateAnswer({
    prompt: quest.challengePrompt,
    attempt,
    target: catalogTarget ?? quest.newStructure,
    attemptCount: quest.attempts + 1,
  });

  if ("error" in result) {
    return { error: result.error };
  }
  const { feedback, degraded } = result;

  let xpAwarded = 0;
  if (feedback.score >= 60) {
    xpAwarded = quest.xpBase;
  } else if (feedback.score >= 40) {
    xpAwarded = Math.round(quest.xpBase / 2);
  }

  const passed = feedback.score >= 60;

  await prisma.$transaction(async (tx) => {
    await tx.aiQuest.update({
      where: { id: quest.id },
      data: {
        attempts: { increment: 1 },
        lastScore: feedback.score,
        status: passed ? "COMPLETED" : "ACTIVE",
        completedAt: passed ? new Date() : null,
      },
    });

    if (xpAwarded > 0) {
      await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: xpAwarded },
          totalXp: { increment: xpAwarded },
        },
      });
    }
  });

  return {
    feedback,
    xpAwarded,
    passed,
    degraded,
  };
}

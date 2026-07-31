import { z } from "zod";
import type { LlmProviderId } from "./providers";
import { getProvider } from "./providers";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  provider: LlmProviderId;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatResult {
  text: string;
  model: string;
}

const DEFAULT_MAX_TOKENS = 1024;
const DEFAULT_TEMPERATURE = 0.7;
const REQUEST_TIMEOUT_MS = 60_000;

export class LlmError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "NOT_CONFIGURED"
      | "TIMEOUT"
      | "HTTP_ERROR"
      | "INVALID_JSON"
      | "NETWORK",
    public readonly status?: number,
  ) {
    super(message);
    this.name = "LlmError";
  }
}

export async function chatCompletion(
  options: ChatOptions,
): Promise<ChatResult> {
  const provider = getProvider(options.provider);
  const baseUrl = (options.baseUrl ?? provider.baseUrl).replace(/\/+$/, "");
  const model = options.model ?? provider.defaultModel;

  if (!options.apiKey) {
    throw new LlmError("API key ausente", "NOT_CONFIGURED");
  }
  if (!baseUrl || !model) {
    throw new LlmError(
      "Provedor custom precisa de baseUrl e modelo configurados",
      "NOT_CONFIGURED",
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    };
    if (provider.needsHeader) {
      headers["HTTP-Referer"] = "https://englishquest.app";
      headers["X-Title"] = "EnglishQuest";
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: options.system },
          { role: "user", content: options.user },
        ],
        max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: options.temperature ?? DEFAULT_TEMPERATURE,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new LlmError(
        `Erro do provedor LLM (${response.status}): ${detail.slice(0, 300)}`,
        "HTTP_ERROR",
        response.status,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) {
      throw new LlmError("Resposta vazia do provedor", "HTTP_ERROR");
    }

    return { text, model };
  } catch (err) {
    if (err instanceof LlmError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new LlmError("Tempo de resposta excedido", "TIMEOUT");
    }
    throw new LlmError(
      err instanceof Error ? err.message : "Falha de rede",
      "NETWORK",
    );
  } finally {
    clearTimeout(timeout);
  }
}

export function extractJson<T>(text: string, schema: z.ZodType<T>): T {
  const raw = extractJsonString(text);
  const parsed = JSON.parse(raw) as unknown;
  const result = schema.safeParse(parsed);
  if (!result.success) {
    throw new LlmError(
      `Resposta JSON inválida: ${result.error.message}`,
      "INVALID_JSON",
    );
  }
  return result.data;
}

function extractJsonString(text: string): string {
  const trimmed = text.trim();

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

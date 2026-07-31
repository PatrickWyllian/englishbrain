import { teacherQuestSchema } from "@/lib/teacher/types";
import type { CEFRLevel } from "@/types";
import type { z } from "zod";

// ──── Catálogo de Missões Prontas ────
// Missões curtas autoradas a mão, no mesmo formato das missões geradas por IA.
// Não dependem de LLM: a UI e a correção offline funcionam 100% com este catálogo.

const CEFR_ORDER: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export interface CuratedQuest
  extends z.infer<typeof teacherQuestSchema> {
  /** Slug estável usado para rastrear conclusão (catalogId em AiQuest). */
  id: string;
  /** Resposta-modelo em inglês usada como referência na correção offline. */
  modelAnswer: string;
}

export const CATALOG: CuratedQuest[] = [
  // ──── A1 ────
  {
    id: "a1-pedido-cafe",
    quest_title: "O Pedido na Cafeteria",
    cefr_level: "A1",
    theme: "Comida e bebida",
    narrative_hook:
      "Você está numa cafeteria em Londres e quer pedir um cappuccino para recuperar sua mana.",
    new_structure: "Pedido educado com 'I'd like'",
    challenge_prompt:
      "Escreva uma frase em inglês pedindo um cappuccino para o atendente.",
    hint_progressive: [
      "Comece com 'I'd like...' (eu gostaria de).",
      "Lembre-se da palavra 'please' no final para ser educado.",
      "Exemplo de estrutura: I'd like a ___ , please.",
    ],
    xp_base: 40,
    loot_pool: ["Gota de Mana", "Biscoito Encantado"],
    streak_multiplier_eligible: true,
    modelAnswer: "I'd like a cappuccino, please.",
  },
  {
    id: "a1-me-apresento",
    quest_title: "Apresentação do Herói",
    cefr_level: "A1",
    theme: "Vida diária",
    narrative_hook:
      "Você encontra um grupo de aventureiros na taverna e precisa se apresentar.",
    new_structure: "Verbo 'to be' + apresentação pessoal",
    challenge_prompt:
      "Escreva 3 frases em inglês se apresentando: seu nome, de onde você é e algo que você gosta.",
    hint_progressive: [
      "Use 'My name is...' e 'I am from...'.",
      "Para gostos: 'I like...' (eu gosto de...).",
      "Você pode falar de jogos, música ou comida que gosta.",
    ],
    xp_base: 40,
    loot_pool: ["Poção de XP", "Mapa Inicial"],
    streak_multiplier_eligible: true,
    modelAnswer:
      "My name is Patrick. I am from Brazil. I like video games.",
  },
  {
    id: "a1-pergunto-caminho",
    quest_title: "O Portão do Aeroporto",
    cefr_level: "A1",
    theme: "Viagem",
    narrative_hook:
      "Você está no aeroporto e precisa descobrir onde fica o portão de embarque.",
    new_structure: "Pergunta com 'Where is'",
    challenge_prompt:
      "Escreva uma pergunta em inglês perguntando onde fica o portão de embarque.",
    hint_progressive: [
      "Comece com 'Where is...' (onde fica...).",
      "A palavra para 'portão de embarque' é 'boarding gate'.",
      "Pergunta completa: Where is the ___ ?",
    ],
    xp_base: 40,
    loot_pool: ["Passagem de Trem", "Espada de Iniciante"],
    streak_multiplier_eligible: true,
    modelAnswer: "Where is the boarding gate?",
  },

  // ──── A2 ────
  {
    id: "a2-planos-fim-de-semana",
    quest_title: "Planos de Fim de Semana",
    cefr_level: "A2",
    theme: "Vida diária",
    narrative_hook:
      "Seu grupo de amigos vai explorar uma dungeon no sábado e você conta seus planos.",
    new_structure: "Futuro com 'be going to'",
    challenge_prompt:
      "Escreva uma frase em inglês contando o que você vai fazer no fim de semana usando 'going to'.",
    hint_progressive: [
      "Use a estrutura: am/is/are + going to + verbo.",
      "Exemplo: I am going to visit my friend.",
      "Escolha uma ação de verdade que você faria: jogar, estudar, viajar.",
    ],
    xp_base: 50,
    loot_pool: ["Runas de Futuro", "Chave de Dungeon"],
    streak_multiplier_eligible: true,
    modelAnswer: "I am going to play games on Saturday.",
  },
  {
    id: "a2-pedido-restaurante",
    quest_title: "Jantar no Restaurante",
    cefr_level: "A2",
    theme: "Comida e bebida",
    narrative_hook:
      "O bardo convida você para jantar e é sua vez de fazer o pedido ao garçom.",
    new_structure: "Contáveis/incontáveis + 'would like'",
    challenge_prompt:
      "Escreva duas frases em inglês pedindo uma comida e uma bebida no restaurante.",
    hint_progressive: [
      "Use 'I would like...' ou a forma curta 'I'd like...'.",
      "Para bebidas, diga 'a glass of...' (um copo de...).",
      "Exemplo: I'd like a burger and a glass of juice.",
    ],
    xp_base: 50,
    loot_pool: ["Banquete do Herói", "Cristal de Foco"],
    streak_multiplier_eligible: true,
    modelAnswer:
      "I would like a burger and a glass of orange juice, please.",
  },
  {
    id: "a2-dica-rota",
    quest_title: "Mapa da Cidade",
    cefr_level: "A2",
    theme: "Viagem",
    narrative_hook:
      "Um mercador te dá dicas de como chegar até a torre do mago no centro da cidade.",
    new_structure: "Dar direções com preposições de lugar",
    challenge_prompt:
      "Escreva uma frase em inglês explicando que a torre fica perto da estação de trem.",
    hint_progressive: [
      "Use 'next to' (ao lado de) ou 'near' (perto de).",
      "'Estação de trem' é 'train station'.",
      "Exemplo: The tower is next to the train station.",
    ],
    xp_base: 50,
    loot_pool: ["Mapa da Cidade", "Varinha do Viajante"],
    streak_multiplier_eligible: true,
    modelAnswer: "The tower is near the train station.",
  },

  // ──── B1 ────
  {
    id: "b1-entrevista-emprego",
    quest_title: "Entrevista na Guilda",
    cefr_level: "B1",
    theme: "Negócios",
    narrative_hook:
      "Você está numa entrevista para entrar na Guilda dos Mercadores e precisa falar da sua experiência.",
    new_structure: "Present perfect para experiência",
    challenge_prompt:
      "Escreva uma frase em inglês usando 'have/has worked' contando há quanto tempo você trabalha com algo.",
    hint_progressive: [
      "Use present perfect: have/has + particípio passado.",
      "'worked' é o particípio de 'work'.",
      "Exemplo: I have worked with technology for three years.",
    ],
    xp_base: 60,
    loot_pool: ["Selos de Experiência", "Contrato de Ouro"],
    streak_multiplier_eligible: true,
    modelAnswer: "I have worked with technology for three years.",
  },
  {
    id: "b1-suporte-tecnico",
    quest_title: "Bug na Forja",
    cefr_level: "B1",
    theme: "Tecnologia",
    narrative_hook:
      "O ferreiro do clã não consegue ativar o portal. Você dá instruções para resolver o problema.",
    new_structure: "First conditional (if + will)",
    challenge_prompt:
      "Escreva uma frase em inglês com 'if' dizendo que, se você reiniciar o sistema, ele vai funcionar.",
    hint_progressive: [
      "Use a estrutura: If + presente simples, will + verbo.",
      "'reiniciar' é 'restart'; 'funcionar' é 'work'.",
      "Exemplo: If you restart it, it will work.",
    ],
    xp_base: 60,
    loot_pool: ["Circuito Mágico", "Lente de Inspeção"],
    streak_multiplier_eligible: true,
    modelAnswer: "If you restart the system, it will work.",
  },
  {
    id: "b1-conto-serie",
    quest_title: "O Resumo do Episódio",
    cefr_level: "B1",
    theme: "Séries e filmes",
    narrative_hook:
      "Você conta ao seu clã o que aconteceu no episódio de ontem da sua série favorita.",
    new_structure: "Past simple vs past continuous",
    challenge_prompt:
      "Escreva uma frase em inglês usando 'while' contando algo que você estava fazendo quando a luz acabou.",
    hint_progressive: [
      "Use past continuous para a ação em andamento: was/were + verbo-ing.",
      "Conecte com 'when' ou 'while'.",
      "Exemplo: I was watching TV when the lights went out.",
    ],
    xp_base: 60,
    loot_pool: ["Cota de Maratona", "Spoiler Contido"],
    streak_multiplier_eligible: true,
    modelAnswer:
      "I was watching the series when the lights went out.",
  },

  // ──── B2 ────
  {
    id: "b2-review-jogo",
    quest_title: "Review do Novo MMORPG",
    cefr_level: "B2",
    theme: "Games",
    narrative_hook:
      "O jogo que você esperava lançou, e sua opinião vale ouro no fórum da guilda.",
    new_structure: "Comparativos e superlativos + opinião",
    challenge_prompt:
      "Escreva 2 frases em inglês comparando o jogo novo com o anterior e dando sua opinião.",
    hint_progressive: [
      "Use 'more... than' (mais... que) ou '-er than'.",
      "Para sua opinião: 'In my opinion...' ou 'I think...'.",
      "Exemplo: The new game is more immersive than the old one, in my opinion.",
    ],
    xp_base: 80,
    loot_pool: ["Capa do Fórum", "Cristal de Crítico"],
    streak_multiplier_eligible: true,
    modelAnswer:
      "The new game is more immersive than the old one, but in my opinion the story could be longer.",
  },
  {
    id: "b2-reuniao-negocios",
    quest_title: "Reunião na Câmara do Comércio",
    cefr_level: "B2",
    theme: "Negócios",
    narrative_hook:
      "Na reunião da guilda, você precisa explicar que o relatório será revisado antes do prazo.",
    new_structure: "Voz passiva",
    challenge_prompt:
      "Escreva uma frase em inglês na voz passiva dizendo que o relatório será revisado pelo gerente.",
    hint_progressive: [
      "Voz passiva: will be + particípio passado.",
      "'revisar' é 'review'; 'relatório' é 'report'; 'gerente' é 'manager'.",
      "Exemplo: The report will be reviewed by the manager.",
    ],
    xp_base: 80,
    loot_pool: ["Pergaminho de Contrato", "Medalha de Negociação"],
    streak_multiplier_eligible: true,
    modelAnswer:
      "The report will be reviewed by the manager before the deadline.",
  },
  {
    id: "b2-conselho-saude",
    quest_title: "Poção de Energia",
    cefr_level: "B2",
    theme: "Saúde",
    narrative_hook:
      "Um aliado está exausto no meio da jornada e você dá conselhos para ele se recuperar.",
    new_structure: "Modais de conselho (should/ought to)",
    challenge_prompt:
      "Escreva uma frase em inglês dando conselho a um amigo que está cansado, usando 'should'.",
    hint_progressive: [
      "Use 'You should...' (você deveria...).",
      "Sugira descansar ou dormir mais.",
      "Exemplo: You should rest more and drink water.",
    ],
    xp_base: 80,
    loot_pool: ["Poção de Energia", "Amuleto de Vitalidade"],
    streak_multiplier_eligible: true,
    modelAnswer:
      "You should rest more and drink plenty of water.",
  },

  // ──── C1 ────
  {
    id: "c1-negociacao-tregua",
    quest_title: "Negociação da Trégua",
    cefr_level: "C1",
    theme: "Negócios",
    narrative_hook:
      "Como diplomata da guilda, você precisa negociar termos com uma clã rival.",
    new_structure: "Condicionais mistas",
    challenge_prompt:
      "Escreva uma frase em inglês com condicional mista dizendo que, se tivéssemos sabido do prazo antes, teríamos entregue no tempo.",
    hint_progressive: [
      "Condicional mista (passado → presente): If + past perfect, would + have + particípio.",
      "'prazo' é 'deadline'; 'entregue' é 'delivered'.",
      "Exemplo: If we had known about the deadline earlier, we would have delivered on time.",
    ],
    xp_base: 100,
    loot_pool: ["Diploma de Diplomacia", "Pacto de Aliança"],
    streak_multiplier_eligible: true,
    modelAnswer:
      "If we had known about the deadline earlier, we would have delivered it on time.",
  },
  {
    id: "c1-ensaio-tecnologia",
    quest_title: "Ensaio sobre a Magia Moderna",
    cefr_level: "C1",
    theme: "Tecnologia",
    narrative_hook:
      "A academia de magia pede um ensaio defendendo uma opinião sobre a nova tecnologia de cristais.",
    new_structure: "Cleft sentences para ênfase",
    challenge_prompt:
      "Escreva uma frase em inglês usando 'What... is' para enfatizar que o que diferencia a tecnologia é a adaptabilidade.",
    hint_progressive: [
      "Cleft sentence: What + verbo + is + foco.",
      "'diferenciar' é 'set apart'; 'adaptabilidade' é 'adaptability'.",
      "Exemplo: What sets this technology apart is its adaptability.",
    ],
    xp_base: 100,
    loot_pool: ["Pena do Sábio", "Tomos de Tese"],
    streak_multiplier_eligible: true,
    modelAnswer:
      "What sets this technology apart is its remarkable adaptability.",
  },
  {
    id: "c1-critica-filme",
    quest_title: "Crítica do Filme Épico",
    cefr_level: "C1",
    theme: "Séries e filmes",
    narrative_hook:
      "Sua coluna na gazeta do reino precisa de uma crítica sofisticada do novo filme épico.",
    new_structure: "Inversão após advérbios negativos",
    challenge_prompt:
      "Escreva uma frase em inglês começando com 'Rarely have I...' dizendo que raramente você viu um filme tão equilibrado.",
    hint_progressive: [
      "Inversão: 'Rarely have I seen...' (raramente vi...).",
      "'equilibrado' é 'balanced'.",
      "Complete: Rarely have I seen a film so ___.",
    ],
    xp_base: 100,
    loot_pool: ["Caneta de Crítico", "Trilha Sonora Rara"],
    streak_multiplier_eligible: true,
    modelAnswer:
      "Rarely have I seen a film so balanced between action and emotion.",
  },

  // ──── C2 ────
  {
    id: "c2-politica-edu",
    quest_title: "Discurso no Conselho",
    cefr_level: "C2",
    theme: "Negócios",
    narrative_hook:
      "No Conselho do Reino, você defende que, se o governo investisse em educação, os benefícios superariam os custos.",
    new_structure: "Subjuntivo em hipóteses complexas",
    challenge_prompt:
      "Escreva uma frase em inglês com 'Were... to' (subjuntivo) defendendo um investimento em educação.",
    hint_progressive: [
      "Subjuntivo: 'Were the government to invest...'",
      "Conclua com 'the benefits would outweigh the costs'.",
      "Exemplo: Were the government to invest in education, the benefits would outweigh the costs.",
    ],
    xp_base: 120,
    loot_pool: ["Coroa do Conselho", "Édito Real"],
    streak_multiplier_eligible: true,
    modelAnswer:
      "Were the government to invest in education, the long-term benefits would far outweigh the initial costs.",
  },
  {
    id: "c2-analise-literaria",
    quest_title: "Análise do Último Capítulo",
    cefr_level: "C2",
    theme: "Séries e filmes",
    narrative_hook:
      "Seu ensaio sobre o romance favorito será lido pela Ordem dos Bibliotecários.",
    new_structure: "Fronting para ênfase retórica",
    challenge_prompt:
      "Escreva uma frase em inglês começando com 'Not until...' para enfatizar que só no último capítulo o autor revela o motivo.",
    hint_progressive: [
      "Fronting: 'Not until the final chapter does the author reveal...'",
      "Inverta sujeito/verbo após a expressão negativa.",
      "Exemplo: Not until the final chapter does the author reveal the hero's true motive.",
    ],
    xp_base: 120,
    loot_pool: ["Ex-libris de Prata", "Espiral de Erudição"],
    streak_multiplier_eligible: true,
    modelAnswer:
      "Not until the final chapter does the author reveal the protagonist's true motive.",
  },
  {
    id: "c2-debate-inovacao",
    quest_title: "Debate da Inovação",
    cefr_level: "C2",
    theme: "Tecnologia",
    narrative_hook:
      "O simpósio sobre inteligência artificial exige uma posição formal e sofisticada sobre os novos modelos generativos.",
    new_structure: "Nominalização e registro formal",
    challenge_prompt:
      "Escreva uma frase formal em inglês dizendo que a rápida proliferação de modelos generativos exige reconsiderar a propriedade intelectual.",
    hint_progressive: [
      "Nominalize verbos: 'proliferation' (proliferação), 'reconsideration' (reconsideração).",
      "'propriedade intelectual' é 'intellectual property'.",
      "Exemplo: The rapid proliferation of generative models necessitates a reconsideration of intellectual property frameworks.",
    ],
    xp_base: 120,
    loot_pool: ["Sigilo do Simpósio", "Grimório de Inovação"],
    streak_multiplier_eligible: true,
    modelAnswer:
      "The rapid proliferation of generative models necessitates a reconsideration of current intellectual property frameworks.",
  },
];

const CATALOG_BY_ID = new Map(CATALOG.map((quest) => [quest.id, quest]));

export function getCatalogQuest(id: string): CuratedQuest | undefined {
  return CATALOG_BY_ID.get(id);
}

/**
 * Escolhe a próxima missão pronta não concluída para o jogador.
 * Começa no nível CEFR do jogador (i+1); se o nível estiver completo,
 * sobe para os níveis seguintes. Se tudo estiver concluído, volta do A1.
 */
export function findNextCatalogQuest(
  cefr: CEFRLevel,
  completedIds: ReadonlySet<string>,
): CuratedQuest | null {
  const startIndex = CEFR_ORDER.indexOf(cefr);
  const levels = CEFR_ORDER.slice(startIndex).concat(CEFR_ORDER.slice(0, startIndex));

  for (const level of levels) {
    const next = CATALOG.find(
      (quest) => quest.cefr_level === level && !completedIds.has(quest.id),
    );
    if (next) return next;
  }

  return CATALOG.find((quest) => !completedIds.has(quest.id)) ?? null;
}

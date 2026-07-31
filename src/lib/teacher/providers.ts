export type LlmProviderId = "nvidia" | "openrouter" | "groq" | "custom";

export interface LlmProviderConfig {
  id: LlmProviderId;
  label: string;
  baseUrl: string;
  defaultModel: string;
  needsHeader?: boolean;
}

export const LLM_PROVIDERS: Record<LlmProviderId, LlmProviderConfig> = {
  nvidia: {
    id: "nvidia",
    label: "NVIDIA",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    defaultModel: "nvidia/nemotron-3-ultra-550b-a55b",
  },
  openrouter: {
    id: "openrouter",
    label: "OpenRouter",
    baseUrl: "https://openrouter.ai/api/v1",
    defaultModel: "openai/gpt-4o-mini",
    needsHeader: true,
  },
  groq: {
    id: "groq",
    label: "Groq",
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
  },
  custom: {
    id: "custom",
    label: "Custom (OpenAI-compatível)",
    baseUrl: "",
    defaultModel: "",
  },
};

export const LLM_PROVIDER_IDS = Object.keys(LLM_PROVIDERS) as LlmProviderId[];

export function getProvider(id: string): LlmProviderConfig {
  return LLM_PROVIDERS[id as LlmProviderId] ?? LLM_PROVIDERS.nvidia;
}

export function getEnvApiKey(provider: LlmProviderId): string | undefined {
  switch (provider) {
    case "nvidia":
      return process.env.NVIDIA_API_KEY;
    case "openrouter":
      return process.env.OPENROUTER_API_KEY;
    case "groq":
      return process.env.GROQ_API_KEY;
    default:
      return undefined;
  }
}

export function maskApiKey(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.length <= 8) return "••••";
  return `${key.slice(0, 4)}••••${key.slice(-4)}`;
}

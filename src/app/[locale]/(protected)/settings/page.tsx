"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Settings, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  useLlmSettings,
  useSaveLlmSettings,
  useTestLlmConnection,
} from "@/hooks/use-teacher";
import { LLM_PROVIDERS, type LlmProviderId } from "@/lib/teacher/providers";

interface LlmSettingsFormProps {
  provider: LlmProviderId;
  model: string | null;
  baseUrl: string | null;
  apiKeyMasked: string | null;
  envConfigured: boolean;
}

function LlmSettingsForm({
  provider: initialProvider,
  model: initialModel,
  baseUrl: initialBaseUrl,
  apiKeyMasked,
  envConfigured,
}: LlmSettingsFormProps) {
  const [provider, setProvider] = useState<LlmProviderId>(initialProvider);
  const [model, setModel] = useState(initialModel ?? "");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl ?? "");
  const save = useSaveLlmSettings();
  const test = useTestLlmConnection();

  const activeProvider = LLM_PROVIDERS[provider];

  const handleSave = () => {
    save.mutate({
      provider,
      model: model || undefined,
      apiKey: apiKey || undefined,
      baseUrl: baseUrl || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-n-300">Provedor</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as LlmProviderId)}
          className="flex h-10 w-full rounded-xl border border-n-700 bg-n-900 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg"
        >
          {Object.values(LLM_PROVIDERS).map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Modelo"
        value={model}
        onChange={(e) => setModel(e.target.value)}
        placeholder={activeProvider.defaultModel || "ex: meu-modelo"}
      />

      {provider === "custom" && (
        <Input
          label="Base URL (OpenAI-compatível)"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://sua-api.com/v1"
        />
      )}

      <Input
        label="Chave de API"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder={
          apiKeyMasked
            ? `Chave salva: ${apiKeyMasked}`
            : envConfigured
              ? "Chave via variável de ambiente"
              : "Cole sua chave (nvapi-…, sk-…)"
        }
      />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={save.isPending} isLoading={save.isPending}>
          Salvar
        </Button>
        <Button
          variant="secondary"
          onClick={() => test.mutate()}
          disabled={test.isPending}
        >
          {test.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Testar conexão
        </Button>
      </div>

      {save.data?.error && <p className="text-sm text-error">{save.data.error}</p>}
      {save.data && !save.data.error && (
        <p className="text-sm text-success">Configurações salvas.</p>
      )}

      {test.data?.error && <p className="text-sm text-error">{test.data.error}</p>}
      {test.data?.ok && (
        <div className="flex items-center gap-2">
          <Badge variant="success">Conectado</Badge>
          <span className="text-xs text-n-400">{test.data.model}</span>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: settings } = useLlmSettings();

  return (
    <main className="flex-1 p-4 md:p-8 pb-20 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="rounded-lg p-2 text-n-400 hover:bg-n-800 hover:text-n-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm text-n-400">Configure seu jogo</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Professor / IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-n-400">
            Conecte um modelo de IA para gerar missões sob medida e corrigir suas respostas
            com feedback pedagógico. A chave fica armazenada criptografada.
          </p>

          {settings ? (
            <LlmSettingsForm
              key={`${settings.provider}|${settings.model ?? ""}|${settings.baseUrl ?? ""}`}
              provider={settings.provider as LlmProviderId}
              model={settings.model}
              baseUrl={settings.baseUrl}
              apiKeyMasked={settings.apiKeyMasked}
              envConfigured={settings.envConfigured}
            />
          ) : (
            <div className="h-24 animate-pulse rounded-xl bg-n-800" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-12 pb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-n-800 border border-n-700">
            <Settings className="h-10 w-10 text-info" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Em construção
            </h2>
            <p className="text-n-400 max-w-sm mx-auto">
              Em breve: tema claro/escuro, idioma, notificações, conta. Deixe do seu jeito.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

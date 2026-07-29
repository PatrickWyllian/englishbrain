"use client";

import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";

interface SpeakingEditorProps {
  prompt: string;
  targetSentences: string[];
  hints: string[];
  onChange: (data: {
    prompt: string;
    targetSentences: string[];
    hints: string[];
  }) => void;
}

export function SpeakingEditor({
  prompt,
  targetSentences,
  hints,
  onChange,
}: SpeakingEditorProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-display font-semibold text-foreground">
        Exercício de Fala
      </h4>

      <Textarea
        label="Prompt"
        placeholder="Instrução para o aluno falar"
        value={prompt}
        onChange={(e) =>
          onChange({ prompt: e.target.value, targetSentences, hints })
        }
        rows={2}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-n-300">
            Frases Alvo
          </label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              onChange({
                prompt,
                targetSentences: [...targetSentences, ""],
                hints,
              })
            }
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>
        {targetSentences.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              placeholder={`Frase ${i + 1}`}
              value={s}
              onChange={(e) => {
                const updated = [...targetSentences];
                updated[i] = e.target.value;
                onChange({ prompt, targetSentences: updated, hints });
              }}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                onChange({
                  prompt,
                  targetSentences: targetSentences.filter((_, j) => j !== i),
                  hints,
                })
              }
              className="text-n-500 hover:text-error shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-n-300">
            Dicas (opcional)
          </label>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              onChange({ prompt, targetSentences, hints: [...hints, ""] })
            }
          >
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>
        {hints.map((h, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              placeholder={`Dica ${i + 1}`}
              value={h}
              onChange={(e) => {
                const updated = [...hints];
                updated[i] = e.target.value;
                onChange({ prompt, targetSentences, hints: updated });
              }}
              className="flex-1"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                onChange({
                  prompt,
                  targetSentences,
                  hints: hints.filter((_, j) => j !== i),
                })
              }
              className="text-n-500 hover:text-error shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

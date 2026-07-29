"use client";

import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Plus, Trash2 } from "lucide-react";

interface VocabItem {
  word: string;
  translation: string;
  context: string;
}

interface VocabEditorProps {
  items: VocabItem[];
  onChange: (items: VocabItem[]) => void;
}

export function VocabEditor({ items, onChange }: VocabEditorProps) {
  function updateItem(index: number, field: keyof VocabItem, value: string) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    onChange(updated);
  }

  function addItem() {
    onChange([...items, { word: "", translation: "", context: "" }]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-semibold text-foreground">
          Lista de Vocabulário
        </h4>
        <Button size="sm" variant="ghost" onClick={addItem}>
          <Plus className="w-4 h-4" />
          Adicionar
        </Button>
      </div>

      {items.length === 0 && (
        <p className="text-sm text-n-500 text-center py-4">
          Nenhum item adicionado. Clique em &quot;Adicionar&quot; para começar.
        </p>
      )}

      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 p-3 rounded-xl border border-n-700 bg-n-800/50"
          >
            <div className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Input
                  placeholder="Palavra"
                  value={item.word}
                  onChange={(e) => updateItem(index, "word", e.target.value)}
                />
                <Input
                  placeholder="Tradução"
                  value={item.translation}
                  onChange={(e) =>
                    updateItem(index, "translation", e.target.value)
                  }
                />
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeItem(index)}
                className="text-n-500 hover:text-error shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Exemplo de contexto em inglês"
              value={item.context}
              onChange={(e) => updateItem(index, "context", e.target.value)}
              rows={2}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

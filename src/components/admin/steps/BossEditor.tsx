"use client";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2 } from "lucide-react";
import type { McqQuestion } from "@/lib/lesson/types";

interface BossEditorProps {
  timeLimit: number;
  passThreshold: number;
  questions: McqQuestion[];
  onChange: (data: {
    timeLimit: number;
    passThreshold: number;
    questions: McqQuestion[];
  }) => void;
}

export function BossEditor({
  timeLimit,
  passThreshold,
  questions,
  onChange,
}: BossEditorProps) {
  function updateQuestion(index: number, field: keyof McqQuestion, value: unknown) {
    const updated = questions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q,
    );
    onChange({ timeLimit, passThreshold, questions: updated });
  }

  function addQuestion() {
    onChange({
      timeLimit,
      passThreshold,
      questions: [
        ...questions,
        {
          id: `boss-q-${Date.now()}`,
          prompt: "",
          options: ["", "", "", ""],
          correctOption: 0,
        },
      ],
    });
  }

  function removeQuestion(index: number) {
    onChange({
      timeLimit,
      passThreshold,
      questions: questions.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-4">
      <h4 className="font-display font-semibold text-foreground">
        Boss Fight
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Tempo Limite (segundos)"
          type="number"
          value={timeLimit}
          onChange={(e) =>
            onChange({
              timeLimit: parseInt(e.target.value) || 120,
              passThreshold,
              questions,
            })
          }
        />
        <Input
          label="Threshold de Aprovação (%)"
          type="number"
          value={passThreshold}
          onChange={(e) =>
            onChange({
              timeLimit,
              passThreshold: parseInt(e.target.value) || 60,
              questions,
            })
          }
        />
      </div>

      <div className="pt-2 border-t border-n-700 space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="font-display text-sm font-semibold text-n-300">
            Questões
          </h5>
          <Button size="sm" variant="ghost" onClick={addQuestion}>
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>

        {questions.map((q, i) => (
          <div
            key={q.id}
            className="p-3 rounded-xl border border-n-700 bg-n-800/50 space-y-2"
          >
            <div className="flex items-start gap-2">
              <Input
                placeholder="Enunciado da questão"
                value={q.prompt}
                onChange={(e) => updateQuestion(i, "prompt", e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeQuestion(i)}
                className="text-n-500 hover:text-error shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {q.options.map((opt, j) => (
                <div key={j} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`boss-correct-${i}`}
                    checked={q.correctOption === j}
                    onChange={() => updateQuestion(i, "correctOption", j)}
                    className="accent-accent"
                  />
                  <Input
                    placeholder={`Opção ${j + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...q.options];
                      newOpts[j] = e.target.value;
                      updateQuestion(i, "options", newOpts);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

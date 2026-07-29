"use client";

import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Plus, Trash2, Upload } from "lucide-react";
import type { McqQuestion } from "@/lib/lesson/types";

interface ListeningEditorProps {
  audioSrc: string;
  transcript: string;
  questions: McqQuestion[];
  onChange: (data: {
    audioSrc: string;
    transcript: string;
    questions: McqQuestion[];
  }) => void;
}

export function ListeningEditor({
  audioSrc,
  transcript,
  questions,
  onChange,
}: ListeningEditorProps) {
  function updateQuestion(index: number, field: keyof McqQuestion, value: unknown) {
    const updated = questions.map((q, i) =>
      i === index ? { ...q, [field]: value } : q,
    );
    onChange({ audioSrc, transcript, questions: updated });
  }

  function addQuestion() {
    onChange({
      audioSrc,
      transcript,
      questions: [
        ...questions,
        {
          id: `listen-q-${Date.now()}`,
          prompt: "",
          options: ["", "", "", ""],
          correctOption: 0,
        },
      ],
    });
  }

  function removeQuestion(index: number) {
    onChange({
      audioSrc,
      transcript,
      questions: questions.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="space-y-4">
      <h4 className="font-display font-semibold text-foreground">
        Exercício de Escuta
      </h4>

      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-n-300">
          Áudio
        </label>
        <div className="flex items-center gap-3">
          <Input
            placeholder="URL do áudio"
            value={audioSrc}
            onChange={(e) =>
              onChange({ audioSrc: e.target.value, transcript, questions })
            }
            className="flex-1"
          />
          <Button variant="secondary" size="sm" type="button">
            <Upload className="w-4 h-4" />
            Upload
          </Button>
        </div>
      </div>

      <Textarea
        label="Transcrição"
        placeholder="Transcrição do áudio em inglês"
        value={transcript}
        onChange={(e) =>
          onChange({ audioSrc, transcript: e.target.value, questions })
        }
        rows={4}
      />

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
                    name={`listen-correct-${i}`}
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

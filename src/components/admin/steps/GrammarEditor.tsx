"use client";

import { Input, Textarea } from "@/components/ui/Input";

interface GrammarEditorProps {
  rule: string;
  explanation: string;
  questionPrompt: string;
  questionOptions: string[];
  correctOption: number;
  explanationQuestion?: string;
  onChange: (data: {
    rule: string;
    explanation: string;
    questionPrompt: string;
    questionOptions: string[];
    correctOption: number;
    explanationQuestion?: string;
  }) => void;
}

export function GrammarEditor({
  rule,
  explanation,
  questionPrompt,
  questionOptions,
  correctOption,
  explanationQuestion,
  onChange,
}: GrammarEditorProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-display font-semibold text-foreground">
        Regra de Gramática
      </h4>

      <Input
        label="Regra"
        placeholder="Ex.: Usamos 'going to' para planos futuros"
        value={rule}
        onChange={(e) => onChange({ rule: e.target.value, explanation, questionPrompt, questionOptions, correctOption, explanationQuestion })}
      />

      <Textarea
        label="Explicação"
        placeholder="Explicação detalhada da regra com exemplos"
        value={explanation}
        onChange={(e) => onChange({ rule, explanation: e.target.value, questionPrompt, questionOptions, correctOption, explanationQuestion })}
        rows={3}
      />

      <div className="pt-2 border-t border-n-700 space-y-3">
        <h5 className="font-display text-sm font-semibold text-n-300">
          Questão de Exercício
        </h5>

        <Input
          label="Enunciado"
          placeholder="Ex.: Complete: 'We ___ going to reschedule'"
          value={questionPrompt}
          onChange={(e) => onChange({ rule, explanation, questionPrompt: e.target.value, questionOptions, correctOption, explanationQuestion })}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-n-300">
            Opções (4)
          </label>
          {questionOptions.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctOption"
                checked={correctOption === i}
                onChange={() => onChange({ rule, explanation, questionPrompt, questionOptions, correctOption: i, explanationQuestion })}
                className="accent-accent"
              />
              <Input
                placeholder={`Opção ${i + 1}`}
                value={opt}
                onChange={(e) => {
                  const newOptions = [...questionOptions];
                  newOptions[i] = e.target.value;
                  onChange({ rule, explanation, questionPrompt, questionOptions: newOptions, correctOption, explanationQuestion });
                }}
              />
            </div>
          ))}
        </div>

        <Textarea
          label="Explicação da questão"
          placeholder="Por que a resposta correta está certa"
          value={explanationQuestion ?? ""}
          onChange={(e) => onChange({ rule, explanation, questionPrompt, questionOptions, correctOption, explanationQuestion: e.target.value })}
          rows={2}
        />
      </div>
    </div>
  );
}

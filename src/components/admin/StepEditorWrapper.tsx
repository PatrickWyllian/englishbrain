"use client";

import { VocabEditor } from "./steps/VocabEditor";
import { GrammarEditor } from "./steps/GrammarEditor";
import { ListeningEditor } from "./steps/ListeningEditor";
import { SpeakingEditor } from "./steps/SpeakingEditor";
import { ReadingEditor } from "./steps/ReadingEditor";
import { WritingEditor } from "./steps/WritingEditor";
import { BossEditor } from "./steps/BossEditor";
import type { StepType } from "@/lib/lesson/types";

interface StepContent {
  [key: string]: unknown;
}

interface StepEditorWrapperProps {
  type: StepType;
  content: StepContent;
  onChange: (content: StepContent) => void;
}

export function StepEditorWrapper({ type, content, onChange }: StepEditorWrapperProps) {
  switch (type) {
    case "vocab":
      return (
        <VocabEditor
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items={(content.items as any[]) ?? []}
          onChange={(items) => onChange({ ...content, items })}
        />
      );

    case "grammar": {
      const q = (content.question ?? {}) as Record<string, unknown>;
      return (
        <GrammarEditor
          rule={(content.rule as string) ?? ""}
          explanation={(content.explanation as string) ?? ""}
          questionPrompt={(q.prompt as string) ?? ""}
          questionOptions={
            (q.options as string[]) ?? ["", "", "", ""]
          }
          correctOption={(q.correctOption as number) ?? 0}
          explanationQuestion={q.explanation as string}
          onChange={(data) =>
            onChange({
              ...content,
              rule: data.rule,
              explanation: data.explanation,
              question: {
                id: (q.id as string) ?? `grammar-q-${Math.random().toString(36).slice(2)}`,
                prompt: data.questionPrompt,
                options: data.questionOptions,
                correctOption: data.correctOption,
                explanation: data.explanationQuestion,
              },
            })
          }
        />
      );
    }

    case "listening":
      return (
        <ListeningEditor
          audioSrc={(content.audioSrc as string) ?? ""}
          transcript={(content.transcript as string) ?? ""}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          questions={(content.questions as any[]) ?? []}
          onChange={(data) =>
            onChange({
              ...content,
              audioSrc: data.audioSrc,
              transcript: data.transcript,
              questions: data.questions,
            })
          }
        />
      );

    case "speaking":
      return (
        <SpeakingEditor
          prompt={(content.prompt as string) ?? ""}
          targetSentences={(content.targetSentences as string[]) ?? []}
          hints={(content.hints as string[]) ?? []}
          onChange={(data) => onChange({ ...content, ...data })}
        />
      );

    case "reading":
      return (
        <ReadingEditor
          transcript={(content.transcript as string) ?? ""}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          questions={(content.questions as any[]) ?? []}
          onChange={(data) =>
            onChange({ ...content, transcript: data.transcript, questions: data.questions })
          }
        />
      );

    case "writing":
      return (
        <WritingEditor
          prompt={(content.prompt as string) ?? ""}
          targetSentences={(content.targetSentences as string[]) ?? []}
          hints={(content.hints as string[]) ?? []}
          onChange={(data) => onChange({ ...content, ...data })}
        />
      );

    case "boss":
      return (
        <BossEditor
          timeLimit={(content.timeLimit as number) ?? 120}
          passThreshold={(content.passThreshold as number) ?? 60}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          questions={(content.questions as any[]) ?? []}
          onChange={(data) =>
            onChange({
              ...content,
              timeLimit: data.timeLimit,
              passThreshold: data.passThreshold,
              questions: data.questions,
            })
          }
        />
      );

    default:
      return (
        <p className="text-sm text-n-500 text-center py-4">
          Editor para &quot;{type}&quot; não disponível.
        </p>
      );
  }
}

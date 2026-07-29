"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TagInput } from "@/components/admin/TagInput";
import { StepEditorWrapper } from "@/components/admin/StepEditorWrapper";
import { createLesson, updateLesson } from "@/app/actions/admin";
import type { StepType } from "@/lib/lesson/types";
import {
  FileText,
  Layers,
  Zap,
  Trophy,
  Eye,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Plus,
  Trash2,
  GripVertical,
} from "lucide-react";

const STEP_TYPES: { value: StepType; label: string }[] = [
  { value: "vocab", label: "Vocabulário" },
  { value: "grammar", label: "Gramática" },
  { value: "listening", label: "Escuta" },
  { value: "speaking", label: "Fala" },
  { value: "reading", label: "Leitura" },
  { value: "writing", label: "Escrita" },
  { value: "boss", label: "Boss Fight" },
];

const LEVELS = [
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
  { value: "C2", label: "C2" },
];

interface StepDraft {
  id: string;
  type: StepType;
  title: string;
  xpReward: number;
  content: Record<string, unknown>;
}

interface SkillRewardDraft {
  skillId: string;
  xpAmount: number;
}

interface LootDropDraft {
  itemId: string;
  weight: number;
  minLevel: number;
  maxLevel: number | null;
}

interface LessonDraft {
  title: string;
  description: string;
  slug: string;
  level: string;
  xpReward: number;
  manaCost: number;
  estimatedMin: number;
  order: number;
  isActive: boolean;
  contextTags: string[];
  steps: StepDraft[];
  skillRewards: SkillRewardDraft[];
  lootTable: LootDropDraft[] | null;
}

const emptyLesson: LessonDraft = {
  title: "",
  description: "",
  slug: "",
  level: "B1",
  xpReward: 100,
  manaCost: 10,
  estimatedMin: 10,
  order: 0,
  isActive: true,
  contextTags: [],
  steps: [],
  skillRewards: [],
  lootTable: null,
};

const STEPS_TAB = [
  { key: "metadata", label: "Metadados", icon: FileText },
  { key: "steps", label: "Etapas", icon: Layers },
  { key: "skills", label: "Skills", icon: Zap },
  { key: "loot", label: "Loot", icon: Trophy },
  { key: "preview", label: "Preview", icon: Eye },
];

interface LessonEditorProps {
  initialData?: Partial<LessonDraft>;
  lessonId?: string;
}

export function LessonEditor({ initialData, lessonId }: LessonEditorProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lesson, setLesson] = useState<LessonDraft>({
    ...emptyLesson,
    ...initialData,
  });

  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const counterRef = useRef(0);

  const nextId = useCallback(() => {
    counterRef.current += 1;
    return `draft-${counterRef.current}`;
  }, []);

  function updateField<K extends keyof LessonDraft>(
    key: K,
    value: LessonDraft[K],
  ) {
    setLesson((prev) => ({ ...prev, [key]: value }));
  }

  function addStep(type: StepType) {
    const newStep: StepDraft = {
      id: nextId(),
      type,
      title: "",
      xpReward: 20,
      content: getDefaultContent(type),
    };
    setLesson((prev) => ({
      ...prev,
      steps: [...prev.steps, newStep],
    }));
    setExpandedStep(lesson.steps.length);
  }

  function removeStep(index: number) {
    setLesson((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index),
    }));
    if (expandedStep === index) setExpandedStep(null);
  }

  function updateStep(index: number, data: Partial<StepDraft>) {
    setLesson((prev) => ({
      ...prev,
      steps: prev.steps.map((s, i) => (i === index ? { ...s, ...data } : s)),
    }));
  }

  function moveStep(index: number, direction: -1 | 1) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= lesson.steps.length) return;
    const newSteps = [...lesson.steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    setLesson((prev) => ({ ...prev, steps: newSteps }));
  }

  function getDefaultContent(type: StepType): Record<string, unknown> {
    switch (type) {
      case "vocab":
        return { items: [] };
      case "grammar":
        return {
          rule: "",
          explanation: "",
          question: {
            id: nextId(),
            prompt: "",
            options: ["", "", "", ""],
            correctOption: 0,
          },
        };
      case "listening":
        return { audioSrc: "", transcript: "", questions: [] };
      case "speaking":
        return { prompt: "", targetSentences: [], hints: [] };
      case "reading":
        return { transcript: "", questions: [] };
      case "writing":
        return { prompt: "", targetSentences: [], hints: [] };
      case "boss":
        return { timeLimit: 120, passThreshold: 60, questions: [] };
      default:
        return {};
    }
  }

  function autoSlug() {
    const slug = lesson.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    updateField("slug", slug);
  }

  async function handleSave(publish: boolean) {
    if (!lesson.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }
    if (!lesson.slug.trim()) {
      toast.error("Slug é obrigatório");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...lesson,
        level: lesson.level as "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
        isActive: publish,
        steps: lesson.steps.map((s, i) => ({
          type: s.type,
          title: s.title,
          order: i,
          xpReward: s.xpReward,
          content: s.content,
        })),
        skillRewards: lesson.skillRewards,
        lootTable: lesson.lootTable
          ? { drops: lesson.lootTable }
          : null,
      };

      let result;
      if (lessonId) {
        result = await updateLesson(lessonId, payload);
      } else {
        result = await createLesson(payload);
      }

      if (result && "error" in result) {
        toast.error(result.error);
      } else {
        toast.success(lessonId ? "Lição atualizada!" : "Lição criada!");
        router.push("/admin/lessons");
      }
    } catch {
      toast.error("Erro ao salvar lição");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {lessonId ? "Editar Lição" : "Nova Lição"}
          </h1>
          <p className="text-sm text-n-400 mt-1">
            Preencha os dados e etapas da lição.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            Salvar Rascunho
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            <Send className="w-4 h-4" />
            Publicar
          </Button>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {STEPS_TAB.map((tab, i) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === i
                  ? "bg-accent/10 text-accent"
                  : "text-n-400 hover:text-n-200 hover:bg-n-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Metadados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Título"
              placeholder="Ex.: Ep. 1: The Interview"
              value={lesson.title}
              onChange={(e) => updateField("title", e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-n-300">
                Slug
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="the-interview"
                  value={lesson.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  className="flex-1"
                />
                <Button variant="secondary" size="sm" onClick={autoSlug}>
                  Auto
                </Button>
              </div>
            </div>

            <Textarea
              label="Descrição"
              placeholder="Descrição curta da lição"
              value={lesson.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
            />

            <TagInput
              value={lesson.contextTags}
              onChange={(tags) => updateField("contextTags", tags)}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Select
                label="Nível"
                value={lesson.level}
                onChange={(e) => updateField("level", e.target.value)}
                options={LEVELS}
              />
              <Input
                label="XP Total"
                type="number"
                value={lesson.xpReward}
                onChange={(e) =>
                  updateField("xpReward", parseInt(e.target.value) || 0)
                }
              />
              <Input
                label="Custo Mana"
                type="number"
                value={lesson.manaCost}
                onChange={(e) =>
                  updateField("manaCost", parseInt(e.target.value) || 0)
                }
              />
              <Input
                label="Tempo Est. (min)"
                type="number"
                value={lesson.estimatedMin}
                onChange={(e) =>
                  updateField("estimatedMin", parseInt(e.target.value) || 0)
                }
              />
            </div>

            <Input
              label="Ordem"
              type="number"
              value={lesson.order}
              onChange={(e) =>
                updateField("order", parseInt(e.target.value) || 0)
              }
            />
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Etapas da Lição</CardTitle>
              <div className="flex gap-1">
                {STEP_TYPES.map((st) => (
                  <Button
                    key={st.value}
                    size="sm"
                    variant="ghost"
                    onClick={() => addStep(st.value)}
                  >
                    <Plus className="w-3 h-3" />
                    {st.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {lesson.steps.length === 0 && (
              <p className="text-sm text-n-500 text-center py-8">
                Nenhuma etapa adicionada. Use os botões acima para criar etapas.
              </p>
            )}

            {lesson.steps.map((step, index) => (
              <div
                key={step.id}
                className="border border-n-700 rounded-xl overflow-hidden"
              >
                <div
                  className="flex items-center gap-3 p-3 bg-n-800/50 cursor-pointer"
                  onClick={() =>
                    setExpandedStep(expandedStep === index ? null : index)
                  }
                >
                  <GripVertical className="w-4 h-4 text-n-500" />
                  <span className="text-xs font-display font-semibold text-accent uppercase w-16">
                    {STEP_TYPES.find((t) => t.value === step.type)?.label ??
                      step.type}
                  </span>
                  <Input
                    placeholder="Título da etapa"
                    value={step.title}
                    onChange={(e) =>
                      updateStep(index, { title: e.target.value })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 h-8 text-sm"
                  />
                  <Input
                    type="number"
                    value={step.xpReward}
                    onChange={(e) =>
                      updateStep(index, {
                        xpReward: parseInt(e.target.value) || 0,
                      })
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-20 h-8 text-sm"
                  />
                  <span className="text-xs text-n-500">XP</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveStep(index, -1);
                    }}
                    disabled={index === 0}
                    className="text-n-500"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveStep(index, 1);
                    }}
                    disabled={index === lesson.steps.length - 1}
                    className="text-n-500"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStep(index);
                    }}
                    className="text-n-500 hover:text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {expandedStep === index && (
                  <div className="p-4 border-t border-n-700">
                    <StepEditorWrapper
                      type={step.type}
                      content={step.content}
                      onChange={(content) =>
                        updateStep(index, { content })
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recompensas de Skill</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  updateField("skillRewards", [
                    ...lesson.skillRewards,
                    { skillId: "", xpAmount: 10 },
                  ])
                }
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {lesson.skillRewards.length === 0 && (
              <p className="text-sm text-n-500 text-center py-4">
                Nenhuma recompensa de skill configurada.
              </p>
            )}

            {lesson.skillRewards.map((sr, i) => (
              <div key={i} className="flex items-center gap-3">
                <Input
                  placeholder="skillId"
                  value={sr.skillId}
                  onChange={(e) => {
                    const updated = [...lesson.skillRewards];
                    updated[i] = { ...updated[i], skillId: e.target.value };
                    updateField("skillRewards", updated);
                  }}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="XP"
                  value={sr.xpAmount}
                  onChange={(e) => {
                    const updated = [...lesson.skillRewards];
                    updated[i] = {
                      ...updated[i],
                      xpAmount: parseInt(e.target.value) || 0,
                    };
                    updateField("skillRewards", updated);
                  }}
                  className="w-24"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    updateField(
                      "skillRewards",
                      lesson.skillRewards.filter((_, j) => j !== i),
                    )
                  }
                  className="text-n-500 hover:text-error"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Loot Table</CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  updateField("lootTable", [
                    ...(lesson.lootTable ?? []),
                    { itemId: "", weight: 100, minLevel: 1, maxLevel: null },
                  ])
                }
              >
                <Plus className="w-4 h-4" />
                Adicionar Drop
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!lesson.lootTable || lesson.lootTable.length === 0 ? (
              <p className="text-sm text-n-500 text-center py-4">
                Nenhum drop configurado.
              </p>
            ) : (
              lesson.lootTable.map((drop, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Input
                    placeholder="itemId"
                    value={drop.itemId}
                    onChange={(e) => {
                      const updated = [...lesson.lootTable!];
                      updated[i] = { ...updated[i], itemId: e.target.value };
                      updateField("lootTable", updated);
                    }}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Peso"
                    value={drop.weight}
                    onChange={(e) => {
                      const updated = [...lesson.lootTable!];
                      updated[i] = {
                        ...updated[i],
                        weight: parseInt(e.target.value) || 100,
                      };
                      updateField("lootTable", updated);
                    }}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    placeholder="Min Lv"
                    value={drop.minLevel}
                    onChange={(e) => {
                      const updated = [...lesson.lootTable!];
                      updated[i] = {
                        ...updated[i],
                        minLevel: parseInt(e.target.value) || 1,
                      };
                      updateField("lootTable", updated);
                    }}
                    className="w-20"
                  />
                  <Input
                    type="number"
                    placeholder="Max Lv"
                    value={drop.maxLevel ?? ""}
                    onChange={(e) => {
                      const updated = [...lesson.lootTable!];
                      updated[i] = {
                        ...updated[i],
                        maxLevel: e.target.value
                          ? parseInt(e.target.value)
                          : null,
                      };
                      updateField("lootTable", updated);
                    }}
                    className="w-20"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      updateField(
                        "lootTable",
                        lesson.lootTable!.filter((_, j) => j !== i),
                      )
                    }
                    className="text-n-500 hover:text-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Preview da Lição</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold text-foreground">
                {lesson.title || "Sem título"}
              </h2>
              <p className="text-n-400">{lesson.description}</p>
              <div className="flex flex-wrap gap-2">
                {lesson.contextTags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-lg"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex gap-4 text-sm text-n-400">
                <span>Nível: {lesson.level}</span>
                <span>XP: {lesson.xpReward}</span>
                <span>Mana: {lesson.manaCost}</span>
                <span>~{lesson.estimatedMin} min</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-display font-semibold text-n-200">
                Etapas ({lesson.steps.length})
              </h3>
              {lesson.steps.map((step, i) => (
                <div
                  key={step.id}
                  className="p-3 rounded-xl border border-n-700 bg-n-800/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-display font-semibold text-accent uppercase">
                      {i + 1}.
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {step.title || "Sem título"}
                    </span>
                    <span className="text-xs text-n-500 ml-auto">
                      {STEP_TYPES.find((t) => t.value === step.type)?.label} •{" "}
                      {step.xpReward} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

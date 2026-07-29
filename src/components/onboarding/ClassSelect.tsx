"use client";

import { motion } from "framer-motion";
import type { PlayerClass } from "@/types";
import { Headphones, BookOpen, Swords, Wand2 } from "lucide-react";

const CLASSES: {
  id: PlayerClass;
  name: string;
  tagline: string;
  focus: string;
  starterBranch: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "WARRIOR",
    name: "Guerreiro",
    tagline: "A voz da guilda",
    focus: "Fala rápida e confiança na pronúncia",
    starterBranch: "SPEAKING",
    color: "#EF4444",
    icon: <Swords className="w-8 h-8" />,
  },
  {
    id: "ROGUE",
    name: "Ladino",
    tagline: "Ouvido afiado",
    focus: "Listening e compreensão de sotaques",
    starterBranch: "LISTENING",
    color: "#22C55E",
    icon: <Headphones className="w-8 h-8" />,
  },
  {
    id: "MAGE",
    name: "Mago",
    tagline: "Domínio das palavras",
    focus: "Escrita, grammar e vocabulário rico",
    starterBranch: "WRITING",
    color: "#3B82F6",
    icon: <Wand2 className="w-8 h-8" />,
  },
  {
    id: "CLERIC",
    name: "Clérigo",
    tagline: "Erudito das páginas",
    focus: "Leitura e interpretação de textos",
    starterBranch: "READING",
    color: "#A855F7",
    icon: <BookOpen className="w-8 h-8" />,
  },
];

export function ClassSelect({
  selected,
  onChange,
}: {
  selected: PlayerClass | null;
  onChange: (cls: PlayerClass) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-bold tracking-tight">
          Escolha sua classe
        </h2>
        <p className="text-n-400 max-w-lg">
          Sua classe define seu starter build — mas você pode desbloquear todas
          as skill trees depois. Sem pedras no caminho.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CLASSES.map((cls) => {
          const isSelected = selected === cls.id;
          return (
            <motion.button
              key={cls.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onChange(cls.id)}
              className={`
                relative text-left rounded-2xl border p-6 transition-all
                ${
                  isSelected
                    ? "bg-n-800 border-2"
                    : "bg-n-900 border-n-700 hover:border-n-500"
                }
              `}
              style={isSelected ? { borderColor: cls.color } : undefined}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="rounded-xl p-3"
                  style={{ backgroundColor: `${cls.color}20`, color: cls.color }}
                >
                  {cls.icon}
                </div>
                {isSelected && (
                  <div
                    className="text-xs font-display font-bold uppercase tracking-wider px-2 py-1 rounded"
                    style={{ backgroundColor: cls.color, color: "#0C0A09" }}
                  >
                    Selecionado
                  </div>
                )}
              </div>
              <h3 className="font-display text-xl font-bold mb-1">{cls.name}</h3>
              <p className="text-sm font-medium mb-2" style={{ color: cls.color }}>
                {cls.tagline}
              </p>
              <p className="text-sm text-n-400">{cls.focus}</p>
              <p className="text-xs text-n-500 mt-3">
                Starter branch: {" "}
                <span className="text-n-300 font-medium">{cls.starterBranch}</span>
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

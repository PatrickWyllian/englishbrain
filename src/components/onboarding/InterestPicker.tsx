"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Check } from "lucide-react";
import type { InterestTag } from "@/types";

const INTERESTS: InterestTag[] = [
  { id: "the-office", label: "The Office", icon: "\uD83D\uDCC4", description: "Comédia corporativa, idiomas informais" },
  { id: "friends", label: "Friends", icon: "☕", description: "Inglês casual do dia a dia" },
  { id: "breaking-bad", label: "Breaking Bad", icon: "\u2697\uFE0F", description: "Tensão, gírias, diálogos afiados" },
  { id: "game-of-thrones", label: "Game of Thrones", icon: "\uD83D\uDDE1\uFE0F", description: "Vocabulário épico e formal" },
  { id: "stranger-things", label: "Stranger Things", icon: "\uD83D\uDD12", description: "Anos 80, aventura, cultura pop" },
  { id: "tech", label: "Tecnologia", icon: "\uD83D\uDCBB", description: "Standups, code review, docs" },
  { id: "business", label: "Negócios", icon: "\uD83D\uDCC8", description: "Reuniões, emails, apresentações" },
  { id: "travel", label: "Viagem", icon: "✈️", description: "Aeroporto, hotel, direções" },
  { id: "gaming", label: "Games", icon: "\uD83C\uDFAE", description: "E-sports, RPGs, game design" },
  { id: "science", label: "Ciência", icon: "\uD83D\uDD2C", description: "Artigos, documentários, palestras" },
  { id: "music", label: "Música", icon: "\uD83C\uDFB5", description: "Letras, entrevistas, podcasts" },
  { id: "movies", label: "Filmes", icon: "\uD83C\uDFAC", description: "Cinema, trailers, reviews" },
  { id: "cooking", label: "Culinária", icon: "\uD83C\uDF73", description: "Receitas, vídeos, ingredientes" },
  { id: "fitness", label: "Fitness", icon: "\uD83D\uDCAA", description: "Treinos, nutrição, motivação" },
  { id: "finance", label: "Finanças", icon: "\uD83D\uDCB0", description: "Investimentos, crypto, economia" },
];

export function InterestPicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return INTERESTS;
    const q = query.toLowerCase();
    return INTERESTS.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
    );
  }, [query]);

  const toggle = (id: string) => {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-3xl font-bold tracking-tight">
          O que você curte?
        </h2>
        <p className="text-n-400 max-w-lg">
          Escolha pelo menos 3 temas. Vamos ensinar inglês usando contextos que
          você realmente gosta.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-n-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar séries, temas, hobbies..."
          className="w-full rounded-xl bg-n-900 border border-n-700 pl-10 pr-4 py-3 text-sm placeholder:text-n-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {filtered.map((item) => {
            const isSelected = selected.includes(item.id);
            return (
              <motion.button
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => toggle(item.id)}
                className={`
                  group relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all
                  ${
                    isSelected
                      ? "bg-accent/10 border-accent text-foreground"
                      : "bg-n-900 border-n-700 text-n-200 hover:border-n-500"
                  }
                `}
              >
                <span className="text-2xl" aria-hidden>
                  {item.icon}
                </span>
                <div>
                  <div className="font-display font-semibold text-sm flex items-center gap-2">
                    {item.label}
                    {isSelected && (
                      <Check className="w-4 h-4 text-accent" strokeWidth={3} />
                    )}
                  </div>
                  <div className="text-xs text-n-500">{item.description}</div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {selected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-n-800/50 border border-n-700 p-4"
        >
          <span className="text-sm font-display font-semibold text-accent">
            {selected.length}
          </span>
          <span className="text-sm text-n-400 ml-1">
            {selected.length === 1 ? "tema selecionado" : "temas selecionados"}
          </span>
        </motion.div>
      )}
    </div>
  );
}

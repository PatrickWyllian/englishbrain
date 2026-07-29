"use client";

import { createSrsState } from "@/lib/srs/sm2";
import type { SrsState } from "@/lib/srs/sm2";
import { upsertSrsCard } from "@/app/actions/srs";

const STORAGE_KEY = "englishquest-lesson-cards";

export interface LessonCard {
  id: string;
  word: string;
  translation: string;
  context?: string;
  tags: string[];
  srs: SrsState;
}

function readCardsFromStorage(): LessonCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LessonCard[];
    return parsed.map((card) => ({
      ...card,
      srs: {
        ...card.srs,
        dueDate: new Date(card.srs.dueDate),
      },
    }));
  } catch {
    return [];
  }
}

function writeCardsToStorage(cards: LessonCard[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function addLessonCards(
  vocabItems: { word: string; translation: string; context?: string }[],
  tags: string[] = [],
  contentType: "VOCAB" | "GRAMMAR" | "PHRASE" = "VOCAB",
): void {
  if (typeof window === "undefined" || vocabItems.length === 0) return;

  const existing = readCardsFromStorage();
  const existingKeys = new Set(
    existing.map((card) => `${card.word}::${card.translation}`)
  );

  const newCards: LessonCard[] = vocabItems
    .filter((item) => !existingKeys.has(`${item.word}::${item.translation}`))
    .map((item, index) => ({
      id: `${item.word}-${Date.now()}-${index}`,
      word: item.word,
      translation: item.translation,
      context: item.context,
      tags,
      srs: createSrsState(),
    }));

  writeCardsToStorage([...existing, ...newCards]);

  newCards.forEach((card) => {
    const contentId = `${card.word}::${card.translation}`;
    upsertSrsCard(contentId, contentType, 2).catch(() => {});
  });
}

export function getLessonCards(): LessonCard[] {
  return readCardsFromStorage();
}

export async function gradeCard(
  contentId: string,
  contentType: "VOCAB" | "GRAMMAR" | "PHRASE",
  grade: number,
): Promise<void> {
  const cards = readCardsFromStorage();
  const cardIndex = cards.findIndex(
    (c) => `${c.word}::${c.translation}` === contentId
  );

  if (cardIndex >= 0) {
    const card = cards[cardIndex];
    const newSrs: SrsState = {
      easeFactor: card.srs.easeFactor,
      interval: card.srs.interval,
      repetitions: card.srs.repetitions,
      dueDate: new Date(card.srs.dueDate),
    };

    if (grade >= 2) {
      if (newSrs.repetitions === 0) newSrs.interval = 1;
      else if (newSrs.repetitions === 1) newSrs.interval = 6;
      else newSrs.interval = Math.round(newSrs.interval * newSrs.easeFactor);
      newSrs.repetitions++;
    } else {
      newSrs.repetitions = 0;
      newSrs.interval = 1;
    }

    const quality = [0, 1, 4, 5][grade];
    newSrs.easeFactor = Math.max(
      1.3,
      newSrs.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + newSrs.interval);
    newSrs.dueDate = dueDate;

    cards[cardIndex] = { ...card, srs: newSrs };
    writeCardsToStorage(cards);
  }

  await upsertSrsCard(contentId, contentType, grade).catch(() => {});
}

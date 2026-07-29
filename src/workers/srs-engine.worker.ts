import { sm2Grade, createSrsState, type SrsState } from "@/lib/srs/sm2";

interface WorkerCard {
  contentId: string;
  contentType: string;
  word: string;
  translation: string;
  context?: string;
  tags: string[];
  srs: SrsState;
}

type WorkerMessage =
  | { type: "addCards"; cards: WorkerCard[] }
  | { type: "gradeCard"; contentId: string; grade: 0 | 1 | 2 | 3 }
  | { type: "getDueCards" }
  | { type: "getAllCards" }
  | { type: "syncFromStorage" };

type WorkerResponse =
  | { type: "cardsAdded"; count: number }
  | { type: "cardGraded"; contentId: string; newState: SrsState }
  | { type: "dueCards"; cards: WorkerCard[] }
  | { type: "allCards"; cards: WorkerCard[] }
  | { type: "synced"; cards: WorkerCard[] };

const cards = new Map<string, WorkerCard>();
const STORAGE_KEY = "englishquest-lesson-cards";

function syncFromLocalStorage(): WorkerCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WorkerCard[];
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

function writeCardsToLocalStorage(cardList: WorkerCard[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cardList));
  } catch {}
}

function persistCards(): void {
  writeCardsToLocalStorage(Array.from(cards.values()));
}

function initializeCards(): void {
  const stored = syncFromLocalStorage();
  for (const card of stored) {
    const key = `${card.word}::${card.translation}`;
    if (!cards.has(key)) {
      cards.set(key, card);
    }
  }
}

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const msg = e.data;

  switch (msg.type) {
    case "addCards": {
      let added = 0;
      for (const card of msg.cards) {
        const key = `${card.word}::${card.translation}`;
        if (!cards.has(key)) {
          cards.set(key, { ...card, srs: createSrsState() });
          added++;
        }
      }
      persistCards();
      const response: WorkerResponse = { type: "cardsAdded", count: added };
      self.postMessage(response);
      break;
    }

    case "gradeCard": {
      const card = cards.get(msg.contentId);
      if (card) {
        const newState = sm2Grade(card.srs, msg.grade);
        card.srs = newState;
        cards.set(msg.contentId, card);
        persistCards();
        const response: WorkerResponse = {
          type: "cardGraded",
          contentId: msg.contentId,
          newState,
        };
        self.postMessage(response);
      }
      break;
    }

    case "getDueCards": {
      const now = new Date();
      const due = Array.from(cards.values()).filter((card) => {
        const dueDate = card.srs.dueDate;
        return dueDate <= now;
      });
      due.sort((a, b) => a.srs.dueDate.getTime() - b.srs.dueDate.getTime());
      const response: WorkerResponse = { type: "dueCards", cards: due };
      self.postMessage(response);
      break;
    }

    case "getAllCards": {
      const all = Array.from(cards.values());
      const response: WorkerResponse = { type: "allCards", cards: all };
      self.postMessage(response);
      break;
    }

    case "syncFromStorage": {
      initializeCards();
      const all = Array.from(cards.values());
      const response: WorkerResponse = { type: "synced", cards: all };
      self.postMessage(response);
      break;
    }
  }
};

initializeCards();

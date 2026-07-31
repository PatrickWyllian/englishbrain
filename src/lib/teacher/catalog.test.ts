// @vitest-environment node
import { describe, it, expect } from "vitest";
import { teacherQuestSchema } from "./types";
import {
  CATALOG,
  getCatalogQuest,
  findNextCatalogQuest,
} from "./catalog";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

describe("catalog de missões prontas", () => {
  it("tem 18 missões, 3 por nível CEFR", () => {
    expect(CATALOG).toHaveLength(18);
    for (const level of CEFR_LEVELS) {
      expect(CATALOG.filter((q) => q.cefr_level === level)).toHaveLength(3);
    }
  });

  it("todas as missões respeitam o teacherQuestSchema", () => {
    for (const quest of CATALOG) {
      expect(teacherQuestSchema.safeParse(quest).success).toBe(true);
    }
  });

  it("ids são únicos", () => {
    const ids = CATALOG.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("toda missão tem modelAnswer e hints de 2 a 4", () => {
    for (const quest of CATALOG) {
      expect(quest.modelAnswer.trim().length).toBeGreaterThan(0);
      expect(quest.hint_progressive.length).toBeGreaterThanOrEqual(2);
      expect(quest.hint_progressive.length).toBeLessThanOrEqual(4);
    }
  });

  it("xp_base está entre 40 e 120", () => {
    for (const quest of CATALOG) {
      expect(quest.xp_base).toBeGreaterThanOrEqual(40);
      expect(quest.xp_base).toBeLessThanOrEqual(120);
    }
  });

  it("loot_pool tem 1 a 2 itens e hints/dicas em pt-BR", () => {
    for (const quest of CATALOG) {
      expect(quest.loot_pool.length).toBeGreaterThanOrEqual(1);
      expect(quest.loot_pool.length).toBeLessThanOrEqual(2);
      for (const hint of quest.hint_progressive) {
        expect(hint).toMatch(/[a-záàâãéèêíìîóòôõúùûç]/i);
      }
    }
  });
});

describe("getCatalogQuest", () => {
  it("retorna a missão pelo id", () => {
    const quest = getCatalogQuest("a1-pedido-cafe");
    expect(quest?.quest_title).toBe("O Pedido na Cafeteria");
  });

  it("retorna undefined para id inexistente", () => {
    expect(getCatalogQuest("nao-existe")).toBeUndefined();
  });
});

describe("findNextCatalogQuest", () => {
  const ids = CATALOG.map((q) => q.id);

  it("retorna a primeira missão do nível do jogador quando nenhuma concluída", () => {
    const next = findNextCatalogQuest("A1", new Set());
    expect(next).toBeDefined();
    expect(next!.cefr_level).toBe("A1");
  });

  it("sobe para o próximo nível quando o nível do jogador está completo", () => {
    const completed = new Set(ids.filter((id) => id.startsWith("a1-")));
    const next = findNextCatalogQuest("A1", completed);
    expect(next?.cefr_level).toBe("A2");
  });

  it("retorna null quando todas as missões estão concluídas", () => {
    expect(findNextCatalogQuest("A1", new Set(ids))).toBeNull();
  });

  it("não repete missões concluídas de outro nível", () => {
    const completed = new Set(ids.filter((id) => id.startsWith("b1-")));
    const next = findNextCatalogQuest("B1", completed);
    expect(completed.has(next!.id)).toBe(false);
  });
});

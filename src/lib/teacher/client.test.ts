// @vitest-environment node
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { extractJson, LlmError, chatCompletion } from "./client";

const schema = z.object({
  quest_title: z.string(),
  xp_base: z.number(),
});

describe("extractJson", () => {
  it("parses a fenced code block", () => {
    const text = 'Here you go:\n```json\n{"quest_title":"A","xp_base":50}\n```';
    expect(extractJson(text, schema)).toEqual({
      quest_title: "A",
      xp_base: 50,
    });
  });

  it("parses raw JSON with surrounding text", () => {
    const text = 'Answer: {"quest_title":"B","xp_base":100} thanks';
    expect(extractJson(text, schema)).toEqual({
      quest_title: "B",
      xp_base: 100,
    });
  });

  it("throws LlmError on invalid schema", () => {
    expect(() => extractJson('{"quest_title":5}', schema)).toThrow(LlmError);
  });
});

describe("chatCompletion", () => {
  it("rejects when no API key", async () => {
    await expect(
      chatCompletion({
        provider: "nvidia",
        apiKey: "",
        system: "s",
        user: "u",
      }),
    ).rejects.toThrow("API key ausente");
  });
});

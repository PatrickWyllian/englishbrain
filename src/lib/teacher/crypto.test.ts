// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import { encryptApiKey, decryptApiKey } from "./crypto";

beforeAll(() => {
  process.env.LLM_ENCRYPTION_SECRET = "test-secret-1234567890";
});

describe("crypto", () => {
  it("decrypts what it encrypts", () => {
    const key = "nvapi-test-1234567890";
    const encrypted = encryptApiKey(key);
    expect(encrypted).not.toBe(key);
    expect(decryptApiKey(encrypted)).toBe(key);
  });

  it("produces a different ciphertext each time (random IV)", () => {
    const key = "nvapi-test-1234567890";
    expect(encryptApiKey(key)).not.toBe(encryptApiKey(key));
  });

  it("throws when secret is too short", () => {
    process.env.LLM_ENCRYPTION_SECRET = "short";
    expect(() => encryptApiKey("key")).toThrow();
  });
});

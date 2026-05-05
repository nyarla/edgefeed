import { describe, expect, it } from "vitest";
import { normalizeText } from "./Text";

describe("normalizeText", () => {
  it("should normalize normal text", () => {
    expect(normalizeText("hello, world!")).toBe("hello, world!");
  });

  it("should replace sequence of whitespace with a single space", () => {
    expect(normalizeText("hello,   world!")).toBe("hello, world!");
    expect(normalizeText("hello,\tworld!")).toBe("hello, world!");
    expect(normalizeText("hello,\nworld!")).toBe("hello, world!");
    expect(normalizeText("hello,\rworld!")).toBe("hello, world!");
  });

  it("should trim leading and trailing whitespace", () => {
    expect(normalizeText("   hello, world!   ")).toBe("hello, world!");
  });

  it("should handle complex whitespace combinations", () => {
    expect(normalizeText("\n  hello, \t world! \r ")).toBe("hello, world!");
  });

  it("should return an empty string for empty input", () => {
    expect(normalizeText("")).toBe("");
  });

  it("should return an empty string for null or undefined", () => {
    expect(normalizeText(null)).toBe("");
    expect(normalizeText(undefined)).toBe("");
  });

  it("should return an empty string for string containing only whitespace", () => {
    expect(normalizeText("   ")).toBe("");
  });
});

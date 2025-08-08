import { describe, expect, it } from "vitest";
import { escapeJSON as t } from "./json";

describe("lib/json#escape", () => {
  it("should be remove `\\t` chars", () => {
    expect(t("\t\tfoo\t\tbar\t\tbaz")).toBe("foobarbaz");
  });

  it("should be remove ANSI escape chars", () => {
    expect(t("\x00\x01\x02\x03foo\x05\x06bar\x08baz\x09\x01")).toBe(
      "foobarbaz",
    );
  });

  it('should be escape `"` and `\\`', () => {
    expect(t('foo"bar\\"baz')).toBe('foo\\"bar\\\\\\"baz');
  });
});

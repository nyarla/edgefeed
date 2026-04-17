import { describe, expect, it } from "vitest";

import { normalize } from "./JSON";

describe("JSON#normalize", () => {
  const n = normalize;

  it("remove leading/tailing space", () => {
    expect(n("   hello, world     ")).toBe("hello, world");
  });

  it("convert various whitespace chars to a single space", () => {
    expect(n("  hello, \r\n\t  \n world\n")).toBe("hello, world");
  });

  it("handle blank or empty input", () => {
    expect(n("")).toBe("");
    expect(n("   ")).toBe("");
  });

  it("preserves internal quotes correctly", () => {
    expect(n('hello,"world"')).toBe('hello,\\"world\\"');
  });

  it("handle control characters", () => {
    expect(n("hello,\u0004world")).toBe("hello, world");
  });

  it("escape double quotes and backslashes", () => {
    expect(n(`a " b \\ \\c ""`)).toBe('a \\" b \\\\ \\\\c \\"\\"');
  });
});

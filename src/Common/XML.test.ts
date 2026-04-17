import { describe, expect, it } from "vitest";

import { escapeXML, unescapeXML } from "./XML";

describe("escape", () => {
  it("replaces special chars to xml entities", () => {
    expect(escapeXML(`foo&<>bar"'baz`)).toBe(
      "foo&amp;&lt;&gt;bar&quot;&apos;baz",
    );
  });
});

describe("unescape", () => {
  it("pass-through if string doesn't have a `&`", () => {
    expect(unescapeXML("foo")).toBe("foo");
  });

  it("unescapes from XML entities", () => {
    expect(unescapeXML("&amp;&lt;&gt;&quot;&apos;")).toBe(`&<>"'`);
  });

  it("unescapes from XML numeric references", () => {
    expect(unescapeXML("&#x20;")).toBe(" ");
    expect(unescapeXML("&#X20;")).toBe(" ");
    expect(unescapeXML("&#32;")).toBe(" ");

    expect(unescapeXML("&#x9;")).toBe("\t");
    expect(unescapeXML("&#Xa;")).toBe("\n");
    expect(unescapeXML("&#xD;")).toBe("\r");
  });

  it("keep invalid markup", () => {
    expect(unescapeXML("&amp")).toBe("&amp");
    expect(unescapeXML("&#x20")).toBe("&#x20");
    expect(unescapeXML("&#32")).toBe("&#32");
  });

  it("replaces to U+FFFD if numeric references is out-of-range of the code point", () => {
    expect(unescapeXML("&#x110000;")).toBe("\uFFFD");
    expect(unescapeXML("&#31;")).toBe("\uFFFD");
    expect(unescapeXML("&#0;")).toBe("\uFFFD");
    expect(unescapeXML("&#x1;")).toBe("\uFFFD");
  });

  it("edge cases tests", () => {
    expect(unescapeXML("&amp;amp;")).toBe("&amp;");
    expect(unescapeXML("&;amp;")).toBe("&;amp;");
  });
});

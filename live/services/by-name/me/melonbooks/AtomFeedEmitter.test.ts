import { XMLParser } from "fast-xml-parser";
import { describe, expect, it } from "vitest";
import { AtomFeedEmitter } from "@/services/by-name/me/melonbooks/AtomFeedEmitter";
import { HTMLRewriterTransformer } from "@/services/by-name/me/melonbooks/HTMLRewriterTransformer";
import data from "./data.html";

describe("melonbooks/atomfeed", () => {
  it("atomfeed", async () => {
    const src = new Response(data, { status: 200 });

    const emitter = new AtomFeedEmitter("https://example.com/atomfeed.xml");
    const parser = new HTMLRewriterTransformer(emitter);
    const payload = await parser.parse(src);

    expect(payload).toBeTruthy();

    const { atom } = new XMLParser({ ignoreAttributes: false }).parse(payload);

    expect(atom?.id).toBe("https://example.com/atomfeed.xml");
    expect(atom?.title).match(/.+ - メロンブックス/);
    expect(new Date(atom?.updated)).toBeInstanceOf(Date);
    expect(atom?.link).match(
      /^https:\/\/www\.melonbooks\.co\.jp\/circle\/index.php\?circle_id=\d+$/,
    );
    expect(atom?.author?.name).toBeTruthy();
    expect(atom?.generator["#text"]).toBe(
      "edgefeed - the website to feed transformer.",
    );

    for (const item of atom.entry) {
      expect(item.id).match(/^https:\/\/www\.melonbooks\.co\.jp\//);

      expect(item.title).toBeTruthy();
      expect(item.title["#text"]).not.match(/undefined/);
      expect(item.title["@_type"]).toBe("html");

      expect(new Date(item.updated)).toBeInstanceOf(Date);

      expect(item.link["@_rel"]).toBe("alternate");
      expect(item.link["@_href"]).match(/^https:\/\/www\.melonbooks\.co\.jp\//);

      expect(item.content).toBeTruthy();
      expect(item.content["#text"]).not.match(/undefined/);
      expect(item.content["@_type"]).toBe("html");
    }
  });
});

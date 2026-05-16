import { XMLParser } from "fast-xml-parser";
import { describe, expect, it } from "vitest";
import { Emitter } from "@/Common/Emitter";
import { ParserContext } from "@/Common/ParserContext";
import { Transformer } from "@/Common/Transformer";
import { AtomFeedRenderer } from "@/Feeds/Melonbooks/AtomFeedRenderer";
import { configs } from "@/Feeds/Melonbooks/Configs";
import type { Item, Prop, Scope } from "@/Feeds/Melonbooks/Types";
import fixture from "./fixture.html";

describe("Melonbooks", () => {
  describe("AtomFeedRenderer", async () => {
    const emitter = new Emitter<Scope, Item>({ renderer: AtomFeedRenderer });
    const pc = new ParserContext<Scope>("global");

    const transformer = new Transformer<Scope, Prop>(emitter, pc, configs);
    const src = new Response(fixture, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });

    emitter.set("global", 0, {
      feedUrl: "https://www.example.com/melonbooks.atom.xml",
    });

    const { atom } = new XMLParser({ ignoreAttributes: false }).parse(
      await transformer.transform(src),
    );

    it("should include the feed title", () => {
      expect(atom?.title?.["#text"]).toBe("GRINP");
      expect(atom?.title?.["@_type"]).toBe("text");
    });

    it("should include the generated time as an ISO date string", () => {
      expect(atom?.updated).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/,
      );
    });

    it("should include the alternate link for a permalink page", () => {
      expect(atom?.link?.[0]?.["@_rel"]).toBe("alternate");
      expect(atom?.link?.[0]?.["@_type"]).toBe("text/html");
      expect(atom?.link?.[0]?.["@_href"]).toMatch(
        /^https:\/\/www.melonbooks\.co\.jp\/circle\/index\.php\?circle_id=\d+$/,
      );
    });

    it("should include the self link for a feed page", () => {
      expect(atom?.link?.[1]?.["@_rel"]).toBe("self");
      expect(atom?.link?.[1]?.["@_type"]).toBe("application/atom+xml");
      expect(atom?.link?.[1]?.["@_href"]).toBe(
        "https://www.example.com/melonbooks.atom.xml",
      );
    });

    it("should include the generator information", () => {
      expect(atom?.generator?.["@_url"]).toBe(
        "https://github.com/nyarla/edgefeed/",
      );

      expect(atom?.generator?.["#text"]).toBeTruthy();
    });

    it("should include the entry IDs", () => {
      expect(atom?.entry?.length).toBeGreaterThan(0);

      for (const { id } of atom?.entry ?? []) {
        expect(id).toMatch(
          /https:\/\/www.melonbooks\.co\.jp\/detail\/detail\.php\?product_id=\d+/,
        );
      }
    });

    it("should include the entry titles", () => {
      expect(atom?.entry?.length).toBeGreaterThan(0);

      for (const { title } of atom?.entry ?? []) {
        expect(title).toBeTruthy();
      }
    });

    it("should include the entry updated time", () => {
      expect(atom?.entry?.length).toBeGreaterThan(0);

      for (const { updated } of atom?.entry ?? []) {
        expect(updated).toMatch(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/,
        );
      }
    });

    it("should include the entry permalinks", () => {
      expect(atom?.entry?.length).toBeGreaterThan(0);

      for (const { link } of atom?.entry ?? []) {
        expect(link?.["@_rel"]).toBe("alternate");
        expect(link?.["@_href"]).toMatch(
          /https:\/\/www.melonbooks\.co\.jp\/detail\/detail\.php\?product_id=\d+/,
        );
      }
    });

    it("should include the entry contents", () => {
      expect(atom?.entry?.length).toBeGreaterThan(0);

      for (const { content } of atom?.entry ?? []) {
        expect(content?.["@_type"]).toBe("html");

        expect(content?.["#text"]).toMatch(
          /<p><a href="[^"]+"><img src="[^"]+" alt="[^"]+" height="450" \/><\/a><\/p>/,
        );
        expect(content?.["#text"]).toMatch(/<\/p>\s*<ul>/);
        expect(content?.["#text"]).toMatch(
          /<li>タイトル：<a href="[^"]+">[^<]+<\/a><\/li>/,
        );
        expect(content?.["#text"]).toMatch(/<li>作者：[^<]+<\/li>/);
        expect(content?.["#text"]).toMatch(/<li>種別：[^<]+<\/li>/);
        expect(content?.["#text"]).toMatch(/<li>価格：[^<]+<\/li>/);
        expect(content?.["#text"]).toMatch(/<li>販売：[^<]+<\/li>/);

        expect(content?.["#text"]).toMatch(/<\/li>\s*<\/ul>/);
      }
    });
  });
});

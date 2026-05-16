import { describe, expect, it } from "vitest";
import { Emitter } from "@/Common/Emitter";
import { ParserContext } from "@/Common/ParserContext";
import { Transformer } from "@/Common/Transformer";
import { configs } from "@/Feeds/Melonbooks/Configs";
import { JSONFeedRenderer } from "@/Feeds/Melonbooks/JSONFeedRenderer";
import type { Item, Prop, Scope } from "@/Feeds/Melonbooks/Types";

import fixture from "./fixture.html";

describe("Melonbooks", () => {
  describe("JSON Feed", async () => {
    const emitter = new Emitter<Scope, Item>({ renderer: JSONFeedRenderer });
    const pc = new ParserContext<Scope>("global");

    const transformer = new Transformer<Scope, Prop>(emitter, pc, configs);
    const src = new Response(fixture, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });

    emitter.set("global", 0, {
      feedUrl: "https://www.example.com/melonbooks.json",
    });

    const payload = JSON.parse(await transformer.transform(src));

    it("should include the JSON Feed properties", () => {
      expect(payload?.version).toBe("https://jsonfeed.org/version/1.1");
      expect(payload?.language).toBe("ja");
    });

    it("should include a feed title", () => {
      expect(payload?.title).toBe("GRINP");
    });

    it("should include a feed URL", () => {
      expect(payload?.feed_url).toBe("https://www.example.com/melonbooks.json");
    });

    it("should include a home page URL", () => {
      expect(payload?.home_page_url).toBe(
        "https://www.melonbooks.co.jp/circle/index.php?circle_id=3753",
      );
    });

    it("should include the entry IDs", () => {
      expect(payload?.items).toBeInstanceOf(Array);
      expect(payload?.items?.length).toBeGreaterThan(0);

      const ids = new Map<string, boolean>();

      for (const { id } of payload?.item ?? []) {
        expect(ids.get(id)).not.toBeTruthy();
        ids.set(id, true);
        expect(id).toBeTruthy();
      }
    });

    it("should include the entry URL", () => {
      expect(payload?.items).toBeInstanceOf(Array);
      expect(payload?.items?.length).toBeGreaterThan(0);

      for (const { url } of payload?.items ?? []) {
        expect(url).toMatch(
          /https:\/\/www\.melonbooks\.co\.jp\/detail\/detail\.php\?product_id=\d+/,
        );
      }
    });

    it("should include the entry titles", () => {
      expect(payload?.items).toBeInstanceOf(Array);
      expect(payload?.items?.length).toBeGreaterThan(0);

      for (const { title } of payload?.items ?? []) {
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(0);
      }
    });

    it("should include the entry thumbnail URLs", () => {
      expect(payload?.items).toBeInstanceOf(Array);
      expect(payload?.items?.length).toBeGreaterThan(0);

      for (const { image } of payload?.items ?? []) {
        const href = new URL(image);

        expect(href.protocol).toBe("https:");
        expect(href.hostname).toBe("melonbooks.akamaized.net");
        expect(href.pathname).toBe("/user_data/packages/resize_image.php");
        expect(href.searchParams.get("width")?.toString()).toMatch(/^\d+$/);
        expect(href.searchParams.get("height")?.toString()).toMatch(/^\d+$/);
        expect(href.searchParams.get("image")?.toString()).toMatch(
          /^\d+\.jpg$/,
        );
      }
    });

    it("should include HTML as the entry content", () => {
      expect(payload?.items).toBeInstanceOf(Array);
      expect(payload?.items?.length).toBeGreaterThan(0);

      for (const { content_html } of payload?.items ?? []) {
        expect(content_html).toMatch(
          /<p><a href="[^"]+"><img src="[^"]+" alt="[^"]+" height="450" \/><\/a><\/p>/,
        );
        expect(content_html).toMatch(/<\/p> <ul>/);
        expect(content_html).toMatch(
          /<li>タイトル：<a href="[^"]+">[^<]+<\/a><\/li>/,
        );
        expect(content_html).toMatch(/<li>作者：[^<]+<\/li>/);
        expect(content_html).toMatch(/<li>種別：[^<]+<\/li>/);
        expect(content_html).toMatch(/<li>価格：[^<]+<\/li>/);
        expect(content_html).toMatch(/<li>販売：[^<]+<\/li>/);

        expect(content_html).toMatch(/<\/li> <\/ul>/);
      }
    });
  });
});

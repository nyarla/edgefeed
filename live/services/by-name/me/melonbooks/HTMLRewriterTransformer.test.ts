import { describe, expect, it } from "vitest";
import { HTMLRewriterTransformer } from "@/services/by-name/me/melonbooks/HTMLRewriterTransformer";
import { JSONFeedEmitter } from "@/services/by-name/me/melonbooks/JSONFeedEmitter";
import data from "./data.html";

describe("melonbooks/parse-v2", () => {
  it("jsonfeed", async () => {
    const src = new Response(data, { status: 200 });
    const emitter = new JSONFeedEmitter("https://example.com/jsonfeed.json");
    const parser = new HTMLRewriterTransformer(emitter);
    const payload = await parser.parse(src);

    expect(payload).toBeTruthy();

    const f = JSON.parse(payload);

    expect(f.version).toBe("https://jsonfeed.org/version/1.1");
    expect(f.title).match(/^.+ - メロンブックス$/);
    expect(f.language).toBe("ja");
    expect(f.home_page_url).match(
      /^https:\/\/www\.melonbooks\.co\.jp\/circle\/index.php\?circle_id=\d+$/,
    );
    expect(f.feed_url).toBe("https://example.com/jsonfeed.json");

    for (const item of f.items) {
      expect(item.id).toBeTruthy();
      expect(item.url).match(/^https:\/\/www\.melonbooks\.co\.jp/);
      expect(item.title).toBeTruthy();
      expect(item.image).match(/^https:\/\/melonbooks\.akamaized\.net/);
      expect(item.content_html).not.include("undefined");
    }
  });
});

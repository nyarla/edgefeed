import { describe, expect, it } from "vitest";
import { HTMLRewriterTransformer } from "@/services/by-name/im/image-line/HTMLRewriterTransformer";
import { JSONFeedEmitter } from "@/services/by-name/im/image-line/JSONFeedEmitter";
import data from "./data.html";

describe("image-line/HTMLRewriterTransformer", () => {
  it("jsonfeed", async () => {
    const src = new Response(data, { status: 200 });
    const emitter = new JSONFeedEmitter("https://example.com/jsonfeed.json");
    const parser = new HTMLRewriterTransformer(emitter);
    const payload = await parser.parse(src);

    expect(payload).toBeTruthy();

    const f = JSON.parse(payload);

    expect(f.version).toBe("https://jsonfeed.org/version/1.1");
    expect(f.title).match(/FL Studio News/);
    expect(f.language).toBe("en");
    expect(f.home_page_url).toBe("https://www.image-line.com/news");
    expect(f.feed_url).toBe("https://example.com/jsonfeed.json");

    for (const i of f.items) {
      expect(i.id).toBeTruthy();
      expect(i.url).match(/^https:\/\/www\.image-line\.com/);
      expect(i.title).toBeTruthy();
      expect(i.image).match(/^https:\/\/www\.image-line\.com/);
      expect(i.content_html).not.include("undefined");
    }
  });
});

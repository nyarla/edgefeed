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

    console.log(payload);

    expect(payload).toBeTruthy();
  });
});

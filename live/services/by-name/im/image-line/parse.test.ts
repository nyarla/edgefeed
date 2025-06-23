import { describe, expect, it } from "vitest";
import data from "./data.html";

import { transformToJSONFeed } from "../../../../../src/services/by-name/im/image-line/parse";

describe("jsonfeed live test", async () => {
  const input = new Response(data, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });

  const json = await transformToJSONFeed(
    input,
    "https://example.com/flstudio-news",
  );

  const payload = JSON.parse(json);

  it("jsonfeed version is 1.1", () => {
    expect(payload.version).toBe("https://jsonfeed.org/version/1.1");
  });

  it("title is not empty", () => {
    expect(payload.title).toBeTruthy();
  });

  it("language is `en-US`", () => {
    expect(payload.language).toBe("en-US");
  });

  it("home_page_url is not empty", () => {
    expect(payload.home_page_url).toBeTruthy();
  });

  it("feed_url is not empty", () => {
    expect(payload.feed_url).toBeTruthy();
  });

  it("for items tests", () => {
    expect(payload.items.length).greaterThan(0);
    for (const item of payload.items) {
      expect(item.title).toBeTruthy();
      expect(item.id).toBeTruthy();
      expect(item.url).toBeTruthy();
      expect(item.date_published).toMatch(
        /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/,
      );

      expect(
        !("banner_image" in item) || item.banner_image.match(/^https:\/\//),
      ).toBeTruthy();

      expect(item.summary).toBeTruthy();

      expect(item.tags.length).greaterThan(0);
    }
  });
});

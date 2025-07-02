import { describe, expect, it } from "vitest";
import { transformToJSONFeed } from "../../../../../src/services/by-name/me/melonbooks/parse";
import data from "./data.html";

describe("jsonfeed live test", async () => {
  const input = new Response(data, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });

  const json = await transformToJSONFeed(
    input,
    "https://example.com/melonbooks/circle/",
  );
  const payload = JSON.parse(json);

  it("jsonfeed version is 1.1", () => {
    expect(payload.version).toBe("https://jsonfeed.org/version/1.1");
  });

  it("jsonfeed language is `ja`", () => {
    expect(payload.language).toBe("ja");
  });

  it("jsonfeed should have the circle name in feed title", () => {
    expect(payload.title).toMatch(/^(.+?) - メロンブックス/);
  });

  it("jsonfeed should have the canonical url as `home_page_url`", () => {
    expect(payload.home_page_url).toMatch(
      /^https:\/\/www\.melonbooks\.co\.jp\/circle\/index\.php\?circle_id=(\d+)/,
    );
  });

  it("jsonfeed should have the authors field.", () => {
    expect(payload.authors.length > 0).toBeTruthy();
    expect(payload.authors[0].name).toBeTruthy();
    expect(payload.authors[0].url).toBe(payload.home_page_url);
  });

  it("jsonfeed should have the items field", () => {
    expect("items" in payload).toBeTruthy();
    expect(payload?.items.length > 0).toBeTruthy();

    for (const item of payload?.items || []) {
      expect(item.title).toBeTruthy();
      expect(item.url).toBeTruthy();
      expect(item.id).toBeTruthy();
      expect(item.id).toBe(item.url);
      expect(item.authors).toBeInstanceOf(Array);
      expect(item.tags).toBeInstanceOf(Array);
      expect(item.content_html).toBeTruthy();
    }
  });
});

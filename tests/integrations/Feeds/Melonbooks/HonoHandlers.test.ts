import {
  createExecutionContext,
  waitOnExecutionContext,
} from "cloudflare:test";
import { env } from "cloudflare:workers";
import { type Context, Hono } from "hono";
import { describe, expect, it } from "vitest";
import {
  CloudflareR2Cache,
  type CloudflareR2CacheBindings,
} from "@/Cache/CloudflareR2Cache";
import { melonbooks } from "@/Feeds/Melonbooks/HonoHandlers";
import { JSONFeedRenderer } from "@/Feeds/Melonbooks/JSONFeedRenderer";
import { createCirclePageRequest } from "@/Feeds/Melonbooks/Requests";

describe("melonbooks", () => {
  const app = new Hono<{ Bindings: CloudflareR2CacheBindings }>();
  app.get(
    "/:id",
    melonbooks({
      userAgent:
        "Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0",
      contentType: "application/feed+json",
      renderer: JSONFeedRenderer,
      createMelonbooksRequest: (id: string, userAgent) =>
        createCirclePageRequest(id, userAgent),
      open: (c: Context, ns: string) => new CloudflareR2Cache(c, ns),
    }),
  );

  it("should render an JSON feed from the fetched and parsed HTML content", async () => {
    const first = createExecutionContext();
    const res = await app.request("/3753", {}, env, first);
    waitOnExecutionContext(first);

    expect(res.ok).toBeTruthy();

    const payload = (await res.json()) as Record<string, string | []>;

    expect(payload?.version).toBe("https://jsonfeed.org/version/1.1");
    expect(payload?.title).toBe("GRINP");
    expect(payload?.feed_url).toBe("http://localhost/3753");
    expect(payload?.home_page_url).toBe(
      "https://www.melonbooks.co.jp/circle/index.php?circle_id=3753",
    );

    expect(payload?.items?.length).toBeGreaterThan(0);
  });

  it("should deduplicate feed entries using a cache.", async () => {
    const first = createExecutionContext();
    const res = await app.request("/3753", {}, env, first);
    waitOnExecutionContext(first);

    expect(res.ok).toBeTruthy();

    const payload = (await res.json()) as Record<string, string | []>;

    expect(payload?.version).toBe("https://jsonfeed.org/version/1.1");
    expect(payload?.title).toBe("GRINP");
    expect(payload?.feed_url).toBe("http://localhost/3753");
    expect(payload?.home_page_url).toBe(
      "https://www.melonbooks.co.jp/circle/index.php?circle_id=3753",
    );

    expect(payload?.items?.length).toBe(0);
  });
});

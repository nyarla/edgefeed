import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { FLStudioNewsToJSONFeed } from "@/services/by-name/im/image-line/handlers";

const app = new Hono();
app.get("/", FLStudioNewsToJSONFeed("https://example.com/"));

describe("flstudio-news/handlers", () => {
  it("live request", async () => {
    const res = await app.request("/", {}, {});

    expect(res.ok).toBeTruthy();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe(
      "application/feed+json; charset=utf-8",
    );
    expect(await res.json()).toBeTruthy();
  });
});

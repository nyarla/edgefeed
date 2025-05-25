import { describe, expect, it } from "vitest";
import { Hono } from "hono";

import { circlePageToJSONFeed } from "../../../../../src/services/by-name/me/melonbooks/handlers";

const app = new Hono();
app.get("/:id", circlePageToJSONFeed("https://example.com/"));

describe("melonbooks/handlers", () => {
  it("invalid url", async () => {
    const res = await app.request("/foo", {}, {});

    expect(res.ok).not.toBeTruthy();
    expect(res.status).toBe(400);
  });

  // This test failed on local environment.
  // At the moment, melonbooks uses weak certificate to their website,
  // it trigger to SSL error on local test
  it.todo("live request", async () => {
    const res = await app.request("/3753", {}, {});

    expect(res.ok).toBeTruthy();
    expect(res.status).toBe(200);
    expect(await res.json()).toBeTruthy();
  });
});

import {
  createExecutionContext,
  waitOnExecutionContext,
} from "cloudflare:test";
import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import {
  CloudflareR2Cache,
  type CloudflareR2CacheBindings,
} from "./CloudflareR2Cache";

describe("CloudflareR2Cache", async () => {
  const app = new Hono<{ Bindings: CloudflareR2CacheBindings }>();
  app.get("/", async (c) => {
    const cache = new CloudflareR2Cache(c, "test");
    const key = new Request("https://localhost", {
      method: "GET",
    });

    const data = await cache.match(key);
    if (!data) {
      const value = new Response("ok", {
        status: 200,
        headers: {
          "Cache-Control": "max-age=3600",
        },
      });
      await cache.put(key, value);
      return c.text("miss");
    }

    return c.text(await data.text());
  });

  app.get("/delete", async (c) => {
    const cache = new CloudflareR2Cache(c, "test");
    const key = new Request("https://localhost", { method: "GET" });

    const data = await cache.match(key);
    if (data) {
      await cache.delete(key);
      return c.text("deleted");
    }

    return c.text("miss");
  });

  it("should cache the data on the first request, and return cached data on the second request", async () => {
    const first = createExecutionContext();
    const miss = await app.request("/", {}, env, first);
    waitOnExecutionContext(first);

    expect(await miss?.text()).toBe("miss");

    const second = createExecutionContext();
    const ok = await app.request("/", {}, env, second);
    waitOnExecutionContext(second);

    expect(await ok?.text()).toBe("ok");
  });

  it("should delete cached data", async () => {
    const first = createExecutionContext();
    const deleted = await app.request("/delete", {}, env, first);
    waitOnExecutionContext(first);

    expect(await deleted?.text()).toBe("deleted");

    const second = createExecutionContext();
    const miss = await app.request("/delete", {}, env, second);
    waitOnExecutionContext(second);

    expect(await miss?.text()).toBe("miss");
  });
});

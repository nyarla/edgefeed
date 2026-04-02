import {
  createExecutionContext,
  waitOnExecutionContext,
} from "cloudflare:test";
import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createCloudflareR2CacheInitializer } from "@/middlewares/by-name/re/CloudflareR2Cache";

describe("CloudflareR2Cache", async () => {
  const app = new Hono();

  app.get("/", async (c) => {
    it("testing for cache intefaces", async () => {
      const cache = await createCloudflareR2CacheInitializer()(c);
      const req = c.req.raw;

      expect(await cache.match(req)).toBeUndefined();

      const res = c.text("ok");
      await cache.put(req, res);

      const cachedResponse = await cache.match(req);
      expect(cachedResponse).toBeTruthy();
      expect(cachedResponse?.ok).toBeTruthy();

      expect(await cachedResponse?.text()).toBe("ok");

      await cache.delete(req);

      expect(await cache.match(req)).toBeUndefined();
    });

    return c.text("ok");
  });

  const ctx = createExecutionContext();
  await (await app.request("/", {}, env, ctx)).text();
  waitOnExecutionContext(ctx);
});

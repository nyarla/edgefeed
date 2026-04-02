import {
  createExecutionContext,
  waitOnExecutionContext,
} from "cloudflare:test";
import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createCloudflareWorkersCacheInitializer } from "@/middlewares/by-name/re/CloudflareWorkersCache";

describe("CloudflareWorkersCache", async () => {
  const app = new Hono();

  app.get("/", async (c) => {
    it("testing for cache intefaces", async () => {
      const cache = await createCloudflareWorkersCacheInitializer()(c);
      expect(cache).toBeInstanceOf(Cache);
    });

    return c.text("ok");
  });

  const ctx = createExecutionContext();
  await (await app.request("/", {}, env, ctx)).text();
  waitOnExecutionContext(ctx);
});

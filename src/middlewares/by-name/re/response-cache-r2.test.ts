import {
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, it } from "vitest";

import type { ICache } from "@/interfaces/cache";
import { type Bindings, R2Cache, middleware } from "./response-cache-r2";

import { Hono } from "hono";

describe("response-cache-r2", () => {
  const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  it("test R2Cache", async () => {
    let ok = null;
    let none = null;

    // simulate cloudflare workers context.
    const ctx = createExecutionContext();

    // create `ICache` interfaces object.
    const cache = R2Cache(env.EDGEFEED_R2_CACHE_BUCKET, 1000);

    // put object with request.
    const key = new Request("http://localhost");
    await cache.put(key, new Response("ok"));

    // at this time, the cache returns data.
    const data = await cache.match(key.clone());
    ok = await data?.text();

    // wait for cache expired.
    await sleep(2000);

    // at now, the cache expired. this call should be return undefined.
    const vanished = await cache.match(key.clone());
    none = await vanished?.text();

    // cleanup cloudflare workers context.
    await waitOnExecutionContext(ctx);

    expect(ok).toBe("ok");
    expect(none).toBeUndefined();
  });

  const open = (bucket: R2Bucket, duration: number): ICache => {
    expect(bucket).toBeTruthy();
    expect(duration >= 0).toBeTruthy();

    return {
      async match(r: Request): Promise<Response | undefined> {
        if (new URL(r.url).pathname === "/cached") {
          return new Response("/cached", { status: 200 });
        }

        return undefined;
      },

      async put(r: Request, w: Response): Promise<void> {
        expect(r).toBeInstanceOf(Request);
        expect(r.bodyUsed).toBeFalsy();

        expect(w).toBeInstanceOf(Response);
        expect(w.bodyUsed).toBeFalsy();

        return;
      },

      async delete(_: Request): Promise<boolean> {
        return true;
      },
    };
  };

  const app = new Hono<{ Bindings: Bindings }>();
  app.get("*", middleware(open));
  app.get("/ok", (c) => c.text("ok"));
  app.get("/cached", (c) => c.text("ok"));
  app.get("/notfound", (c) => c.notFound());

  it("the response returns 200 ok, it should be storing to cache.", async () => {
    const ctx = createExecutionContext();
    const res = await app.request("/ok", {}, env, ctx);
    expect(await res.text()).toBe("ok");
    waitOnExecutionContext(ctx);
  });

  it("the response data exists in cache, it should be returned as response data.", async () => {
    const ctx = createExecutionContext();
    const res = await app.request("/cached", {}, env, ctx);
    expect(await res.text()).toBe("/cached");
    waitOnExecutionContext(ctx);
  });

  it("the original response is not 200 ok, it should not be storing to cache", async () => {
    const ctx = createExecutionContext();
    const res = await app.request("/notfound", {}, env, ctx);
    expect(res.status).toBe(404);
    waitOnExecutionContext(ctx);
  });
});

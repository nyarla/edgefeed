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

  it("test middleware", async () => {
    // make dummy cache interface.
    const open = (bucket: R2Bucket, duration: number): ICache => {
      expect(bucket).toBeTruthy();
      expect(0 <= duration).toBeTruthy();

      return {
        async match(r: Request) {
          return new URL(r.url).pathname === "/foo"
            ? new Response("/foo")
            : undefined;
        },
        async put(_: Request, __: Response) {
          return;
        },
        async delete(_: Request) {
          return true;
        },
      };
    };

    // create Hono instance.
    const app = new Hono<{ Bindings: Bindings }>();
    app.get("*", middleware(open));
    app.get("/foo", (c) => c.text("ok"));
    app.get("/bar", (c) => c.text("ok"));

    // doing tests.
    expect(await (await app.request("/foo", {}, env)).text()).toBe("/foo");
    expect(await (await app.request("/bar", {}, env)).text()).toBe("ok");
  });
});

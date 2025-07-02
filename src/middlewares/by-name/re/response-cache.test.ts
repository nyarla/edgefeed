import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { middleware as responseCache } from "./response-cache";

describe("response-cache", () => {
  const app = new Hono();

  const dummyCacheOpener = async (ns: string): Promise<ICache> => ({
    async match(r: Request): Promise<Response | undefined> {
      if (new URL(r.url).pathname === "/cached") {
        return new Response(ns, { status: 200 });
      }

      return undefined;
    },

    async put(r: Request, w: Response): Promise<void> {
      expect(new URL(r.url).pathname).toBe("/ok");

      expect(r).toBeInstanceOf(Request);
      expect(r.bodyUsed).toBeFalsy();

      expect(w).toBeInstanceOf(Response);
      expect(w.bodyUsed).toBeFalsy();

      return;
    },

    async delete(_: Request): Promise<boolean> {
      return true;
    },
  });

  app.get("*", responseCache(dummyCacheOpener));
  app.get("/ok", (c) => c.text("ok"));
  app.get("/cached", (c) => c.text("ok"));
  app.get("/notfound", (c) => c.notFound());

  it("the response returns 200 ok, it should be storing to cache.", async () => {
    const res = await app.request("/ok", {}, {});
    expect(await res.text()).toBe("ok");
  });

  it("the response data exists in cache, it should be returned as response data.", async () => {
    const res = await app.request("/cached", {}, {});
    expect(await res.text()).toBe("/cached");
  });

  it("the original response is not 200 ok, it should not be storing to cache", async () => {
    const res = await app.request("/notfound", {}, {});
    expect(res.status).toBe(404);
  });
});

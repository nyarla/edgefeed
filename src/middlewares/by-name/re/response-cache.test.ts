import { describe, expect, it } from "vitest";

import { Hono } from "hono";
import { middleware as responseCache } from "./response-cache";

describe("response-cache", () => {
  const app = new Hono();
  const dummryCacheOpener = async (key: string): Promise<ICache> => ({
    match: async (_: Request) =>
      "/foo" === key ? new Response(key, { status: 200 }) : undefined,
    put: (_: Request, __: Response) => {
      return;
    },
    delete: (_: Request) => true,
  });

  app.get("*", responseCache(dummryCacheOpener));
  app.get("/foo", (c) => c.text("ok"));
  app.get("/bar", (c) => c.text("ok"));

  it("if cache data hits, return that", async () => {
    const res = await app.request("/foo", {}, {});
    expect(await res.text()).toBe("/foo");
  });

  it("if cache doesn't hit, the request pass through to controller", async () => {
    const res = await app.request("/bar", {}, {});
    expect(await res.text()).toBe("ok");
  });
});

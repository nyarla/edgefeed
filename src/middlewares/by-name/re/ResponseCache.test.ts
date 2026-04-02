import {
  createExecutionContext,
  waitOnExecutionContext,
} from "cloudflare:test";
import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createInMemoryCacheInitializer } from "@/middlewares/by-name/re/InMemoryCache";
import { createResponseCacheMiddleware } from "@/middlewares/by-name/re/ResponseCache";

describe("ResponseCache", async () => {
  it("if the response status code is 200, this response cached by middleware", async () => {
    const app = new Hono<{ Bindings: InMemoryCacheBindings }>();
    const middleware = createResponseCacheMiddleware(
      createInMemoryCacheInitializer(2000),
    );

    let count = 0;
    app.use("*", middleware);
    app.get("/", (c) => {
      ++count;
      return c.text(count.toString());
    });
    const ctx1 = createExecutionContext();
    const res1 = await app.request("/", {}, env, ctx1);
    waitOnExecutionContext(ctx1);

    expect(await res1.text()).toBe("1");

    const ctx2 = createExecutionContext();
    const res2 = await app.request("/", {}, env, ctx2);
    waitOnExecutionContext(ctx2);

    expect(await res2.text()).toBe("1");
  });
});

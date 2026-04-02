import type { Context, MiddlewareHandler, Next } from "hono";
import type { ICacheInitializer } from "@/interfaces/ICache";

export const createResponseCacheMiddleware =
  (open: ICacheInitializer): MiddlewareHandler =>
  async (c: Context, next: Next) => {
    const cache = await open(c);

    const cachedResponse = await cache.match(c.req.raw);
    if (cachedResponse?.ok) {
      return cachedResponse;
    }

    await next();

    const request = c.req.raw.clone();
    const response = c.res.clone();

    if (response?.ok && response.status === 200) {
      if (typeof c?.executionCtx?.waitUntil === "function") {
        c.executionCtx.waitUntil(cache.put(request, response));
      } else {
        await cache.put(request, response);
      }
    }
  };

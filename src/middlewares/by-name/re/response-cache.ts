import type { ICacheOpener } from "@/interfaces/cache";
import type { Context, MiddlewareHandler, Next } from "hono";

/**
 * The cache middleware for anything.
 *
 * This middleware uses cache namespace from Hono's `c.req.path`.
 *
 * @param open - the cache opener with `ICache` interface.
 * @returns - the Hono's middleware handler for the cachting.
 *
 * @example
 * ```ts
 * import {Hono} from 'hono';
 * import {middleware as cache} from '@/middleware/by-name/re/response-cache';
 *
 * const app = new Hono();
 * app.get('*', cache(caches.open));
 * app.get('/', (c) => c.text('hi!'));
 *
 * export default app;
 * ```
 */
export const middleware =
  (open: ICacheOpener): MiddlewareHandler =>
  async (c: Context, next: Next) => {
    const cache = await open(c.req.path);
    const cachedResponse = await cache.match(c.req.raw);

    if (cachedResponse?.ok) {
      return cachedResponse;
    }

    await next();
  };

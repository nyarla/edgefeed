import type { ICache } from "@/interfaces/cache";
import type { Context, MiddlewareHandler, Next } from "hono";

/**
 * The Bindings for Cloudflare R2 cache middleware.
 */
export type Bindings = {
  /**
   * The Cloudflare R2 Bucket name. Required.
   */
  EDGEFEED_R2_CACHE_BUCKET: R2Bucket;
  /**
   * The cache duration by milliseconds. Required.
   */
  EDGEFEED_R2_CACHE_DURATION: number;
};

/**
 * The type of cache key generator by `Request` object.
 */
export type CacheKeyFactory = (r: Request) => string;

/**
 * To make the `ICache` interface by Cloudflare R2 Woeker API.
 *
 * @param {R2Bucket} bucket - the R2Bucket object.
 * @param {number} duration - the cache duration as milliseconds
 * @param {CacheKeyFactory} cachekey - the function to generate cache key.
 * @returns {ICache} - the cache interface by `@/interfaces/cache#ICache`.
 */
export const R2Cache = (
  bucket: R2Bucket,
  duration: number,
  cachekey?: CacheKeyFactory,
): ICache => {
  const gen =
    cachekey ??
    ((r: Request): string => {
      const href = new URL(r.url);
      href.searchParams.sort();

      const path = href.pathname;
      const query = href.searchParams.toString();

      return query === "" ? path : `${path}?${query}`;
    });

  const cache: ICache = {
    async match(r: Request): Promise<Response | undefined> {
      const key = gen(r);
      const data = await bucket.get(key);

      if (data === null) {
        return undefined;
      }

      if ("body" in data) {
        const expires = data.uploaded.valueOf() + duration;
        const now = Date.now();

        if (expires < now) {
          await data.text();
          return undefined;
        }

        if (data.httpMetadata) {
          const {
            contentType,
            contentLanguage,
            contentEncoding,
            cacheControl,
            cacheExpiry,
          } = data.httpMetadata;

          const headers = new Headers();
          contentType && headers.set("Content-Type", contentType);
          contentLanguage && headers.set("Content-Language", contentLanguage);
          contentEncoding && headers.set("Content-Encoding", contentEncoding);
          cacheControl && headers.set("Cache-Control", cacheControl);
          cacheExpiry && headers.set("Expires", cacheExpiry.toUTCString());

          return new Response(data.body, { status: 200, headers });
        }

        return new Response(data.body, {
          status: 200,
          headers: { "Content-Type": "application/octet-stream" },
        });
      }

      return undefined;
    },

    async put(r: Request, s: Response): Promise<void> {
      const key = gen(r);
      const { body, headers } = s;

      await bucket.put(key, body, { httpMetadata: headers });

      return;
    },

    async delete(r: Request): Promise<boolean> {
      await bucket.delete(gen(r));
      return true;
    },
  };

  return cache;
};

/**
 * The type of opener for R2Cache as `ICache`.
 */
export type R2CacheOpener = typeof R2Cache;

/**
 * The cache middleware backed by Cloudflare R2.
 *
 * @param {R2CacheOpener} opener - the cache opener to Cloudflare R2 cache.
 * @returns {MiddlewareHandler} - the `Hono` middleware.
 */
export const middleware =
  (opener?: R2CacheOpener): MiddlewareHandler =>
  async (c: Context, next: Next) => {
    const open = opener ?? R2Cache;

    const cache = open(
      c.env.EDGEFEED_R2_CACHE_BUCKET,
      c.env.EDGEFEED_R2_CACHE_DURATION,
    );

    const cachedResponse = await cache.match(c.req.raw);

    if (cachedResponse?.ok) {
      return cachedResponse;
    }

    await next();

    const request = c.req.raw.clone();
    const response = c.res.clone();

    if (response.status === 200) {
      try {
        c.executionCtx.waitUntil(cache.put(request, response));
      } catch (e) {
        await cache.put(request, response);
      }
    }
  };

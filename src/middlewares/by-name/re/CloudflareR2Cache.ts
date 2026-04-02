import type { Context } from "hono";
import type { ICache, ICacheInitializer } from "@/interfaces/ICache";

/**
 * The Bindings for Cloudflare R2 cache middleware
 */
export type CloudflareR2CacheBindings = {
  /**
   * The Cloudflare R2 Bucket name, required.
   */
  EDGEFEED_R2_CACHE_BUCKET: R2Bucket;
  /**
   * The caching duration by milliseconds, required.
   */
  EDGEFEED_R2_CACHE_DURATION: number;
};

/**
 * The implementation of Cloudflare R2 Cache.
 **/
export class CloudflareR2Cache implements ICache {
  private r2: R2Bucket;
  private duration: number;

  /**
   * The constructor.
   *
   * @param {R2Bucket} r2 - the instance of R2Bucket.
   * @param {number} duration - the number of cache duration by milliseconds.
   */
  constructor(r2: R2Bucket, duration: number) {
    this.r2 = r2;
    this.duration = duration;
  }

  private key(r: Request) {
    const href = new URL(r.url);
    href.searchParams.sort();

    const path = href.pathname;
    const query = href.searchParams.toString();

    return query === "" ? path : `${path}?${query}`;
  }

  /**
   * Mathcing to cached Response by Request,
   *
   * This method returns cached Response object if the Response cache,
   * or undefined.
   *
   * @param {Request} r - the Request object by Web Standard API.
   * @returns {Promise<Response | undefined>} - the result of cache mathcing.
   * @async
   */
  async match(r: Request): Promise<Response | undefined> {
    const key = this.key(r);
    const data = await this.r2.get(key);

    if (data === null) {
      return undefined;
    }

    if ("body" in data) {
      const expires = data.uploaded.valueOf() + this.duration;
      const now = Date.now();

      if (expires < now) {
        await this.delete(r);
        return undefined;
      }

      const status = 200;
      const headers = new Headers();

      if (data.httpMetadata) {
        const {
          contentType,
          contentLanguage,
          contentEncoding,
          cacheControl,
          cacheExpiry,
        } = data.httpMetadata;

        const headers = new Headers();

        if (contentType) {
          headers.set("Content-Type", contentType);
        }

        if (contentLanguage) {
          headers.set("Content-Language", contentLanguage);
        }

        if (contentEncoding) {
          headers.set("Content-Encoding", contentEncoding);
        }

        if (cacheControl) {
          headers.set("Cache-Control", cacheControl);
        }

        if (cacheExpiry) {
          headers.set("Expires", cacheExpiry.toUTCString());
        }
      } else {
        headers.set("Content-Type", "application/octet-stream");
      }

      return new Response(data.body, { status, headers });
    }
  }

  /**
   * Set to Response Cache by Request as key.
   *
   * @param {Request} req - the Request object as cache key.
   * @param {Response} res - the Response object as cached data.
   * @return {Promise<void>} - this method should calls with async, but no returns anything.
   */
  async put(req: Request, res: Response): Promise<void> {
    const key = this.key(req);
    const { body, headers } = res;

    await this.r2.put(key, body, { httpMetadata: headers });
    return;
  }

  /**
   * Remove cache data by Request as key.
   *
   * @param {Request} - the Request object as delete key.
   * @returns {Promise<boolean>} - this value is always `true`.
   **/
  async delete(r: Request): Promise<boolean> {
    const key = this.key(r);
    await this.r2.delete(key);
    return true;
  }
}

/**
 * The factory function for the ICacheInitializer with CloudflareR2Cache.
 */
export const createCloudflareR2CacheInitializer =
  (): ICacheInitializer => async (c: Context) => {
    const r2 = c.env.EDGEFEED_R2_CACHE_BUCKET;
    const duration = c.env.EDGEFEED_R2_CACHE_DURATION;

    return new CloudflareR2Cache(r2, duration);
  };

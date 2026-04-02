import type { Context } from "hono";
import type { ICache, ICacheInitializer } from "@/interfaces/ICache";

/**
 * This is internal type for InMemoryCache class.
 **/
type CacheData = {
  /**
   * The expires time by milliseconds.
   */
  expires: number;
  /**
   * The cached Response object.
   */
  response: Response;
};

/**
 * The implementation of in-memory cache.
 */
export class InMemoryCache implements ICache {
  private duration: number;
  private cache: Record<string, CacheData> = {};

  /**
   * The constructor
   *
   * @param {number} duration - the cache duration by milliseconds.
   **/
  constructor(duration: number) {
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
   * Matcing the cached Response by Request as key.
   *
   * This function returns Response object if cache matched by Request as key,
   * or returns undefined.
   *
   * @param {Request} r - the Request object as key.
   * @returns {Promise<Response | undefined>} - the cached Response object, or undefined.
   * @async
   */
  async match(r: Request): Promise<Response | undefined> {
    const key = this.key(r);

    if (!(key in this.cache)) {
      return undefined;
    }

    const data = this.cache[key];
    const now = Date.now();

    if (data.expires < now) {
      await this.delete(r);
      return undefined;
    }

    return data.response.clone();
  }

  /**
   * Put Response obejct by Request key.
   *
   * @param {Request} req - the Request object as key.
   * @param {Response} response - the Response object as cached data.
   * @returns {Promise<void>} - this method no returns anything.
   * @async
   */
  async put(req: Request, response: Response): Promise<void> {
    const key = this.key(req);
    const expires = Date.now() + this.duration;

    this.cache[key] = { expires, response };

    return;
  }

  /**
   * Delete cached Response by Request as key.
   *
   * @param {Request} r - the Request key for cache deletion.
   * @returns {Promise<boolean>} - this value is always `true`.
   */
  async delete(r: Request): Promise<boolean> {
    const key = this.key(r);
    delete this.cache[key];
    return true;
  }
}

/**
 * The factory function for in-memory cache initializer.
 *
 * @param {number} duration - the duration of caching data by milliseconds.
 * @returns the ICacheInitializer for in-memory cache.
 */
export const createInMemoryCacheInitializer = (
  duration: number,
): ICacheInitializer => {
  let cache: ICache | null = null;
  return async (_: Context) => {
    if (cache === null) {
      cache = new InMemoryCache(duration);
    }
    return cache;
  };
};

/**
 * The cache interface for everything.
 *
 * This interface based on Cloudflare's `caches` interface,
 * but it could apply to any cache system,
 */
export interface ICache {
  /**
   * Match caceh by `Request` object.
   *
   * If the cache found by `Request`, this function returns `Response` as async data,
   * Otherwise return undefined.
   *
   * @param r Request - the Request object.
   * @returns Promise<Response | underline> - the Response object or undefined.
   */
  match: (r: Request) => Promise<Response | undefined>;

  /**
   * Put `Response` cache by `Request`.
   *
   * @param r Request - the cache key.
   * @param s Response - the cache data.
   * @returns Promise<void> - this function doesn't return anything,
   */
  put: (r: Request, s: Response) => Promise<void>;

  /**
   * Delete `Response` cache by `Request`.
   *
   * If delete cache succeed, this function return true.
   * And anything else, return false.
   *
   * @param r Request - the cache key.
   * @returns boolean - the result of delete cache succeed.
   */
  delete: (r: Request) => Promise<boolean>;
}

/**
 * The interface for open cache instance.
 *
 * @param key string - the key of cache namespace.
 * @returns Promise<ICache> - the instance of cache.
 */
export type ICacheOpener = (key: string) => Promise<ICache>;

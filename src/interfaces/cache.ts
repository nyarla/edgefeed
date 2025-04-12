/**
 * The interface for cache controller.
 *
 * This interface based on Cloudflare's caches,
 * but it can be use by any others.
 */
export interface ICache {
  /**
   * Take the cached `Response` object by `Request`.
   *
   * If the cached response found, this function returns that is,
   * otherwise return undefined.
   *
   * @param {Request} r - the cache key object to find cached `Response`.
   * @returns {Promise<Response | undefined>} - then result to find cache.
   * @async
   */
  match: (r: Request) => Promise<Response | undefined>;

  /**
   * Put `Response` to cache by `Request`.
   *
   * This function should be called from application controller.
   *
   * @param {Request} r - the cache key object by `Request`
   * @param {Response} s - the cache data object by `Response`
   * @returns {Promise<void>} - this functions returns nothing.}
   * @async
   */
  put: (r: Request, s: Response) => Promise<void>;

  /**
   * Delete cache data by `Request`.
   *
   * this function return true if cache was deleted, otherwise return false.
   *
   * @param {Request} r - the cache key by `Request`
   * @returns {Promise<boolean>} - the result of cache is deleted.
   */
  delete: (r: Request) => Promise<boolean>;
}

/**
 * The type interface for open the ICache cache interface.
 *
 * @param {string} key - the namespace key of caches.
 * @returns {Promise<ICache>} - the instance of ICache compatible object.
 * @async
 */
export type ICacheOpener = (key: string) => Promise<ICache>;

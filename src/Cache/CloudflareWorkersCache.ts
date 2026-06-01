import type { Context } from "hono";
import type { CacheInterface, CachesConstructor } from "./Cache";

export const CloudflareWorkersCache: CachesConstructor = class CloudflareWorkersCache
  implements CacheInterface
{
  private ns!: string;
  private cache!: Cache;

  constructor(_: Context, ns: string) {
    this.ns = ns;
  }

  async open(): Promise<Cache> {
    if (!this.cache) {
      this.cache = await caches.open(this.ns);
    }

    return this.cache;
  }

  async put(key: Request, val: Response): Promise<void> {
    return (await this.open()).put(key, val);
  }

  async match(key: Request): Promise<Response | undefined> {
    return (await this.open()).match(key);
  }

  async delete(key: Request): Promise<boolean> {
    return (await this.open()).delete(key);
  }
};

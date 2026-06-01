import type { Context } from "hono";
import type { CacheInterface, CachesConstructor } from "./Cache";

export type CloudflareR2CacheBindings = {
  EDGEFEED_CACHE_R2_BUCKET: R2Bucket;
  EDGEFEED_CACHE_R2_EXPIRY: number;
};

export const CloudflareR2Cache: CachesConstructor = class CloudflareR2Cache
  implements CacheInterface
{
  private r2!: R2Bucket;
  private expiry!: number;
  private ns!: string;

  constructor(c: Context, ns: string) {
    this.ns = ns;
    this.r2 = c.env.EDGEFEED_CACHE_R2_BUCKET;
    this.expiry = c.env.EDGEFEED_CACHE_R2_EXPIRY;
  }

  cacheKey(r: Request) {
    const href = new URL(r.url);
    const domain = href.hostname.split(".").reverse().join(".");
    const path = href.pathname;
    const query = href.searchParams.toString();

    return `${this.ns}/${domain}/${path}${query ? `?${query}` : ""}`;
  }

  async match(r: Request): Promise<Response | undefined> {
    const key = this.cacheKey(r);
    const data = await this.r2.get(key);

    if (!data) {
      return undefined;
    }

    if ("body" in data) {
      const expiry = data.uploaded.valueOf() + this.expiry;
      const now = Date.now();

      if (expiry < now) {
        await this.delete(r);
        return undefined;
      }

      const status = 200;
      const headers = new Headers();

      data.writeHttpMetadata(headers);

      return new Response(data.body, { status, headers });
    }

    return undefined;
  }

  async put(r: Request, val: Response): Promise<void> {
    const key = this.cacheKey(r);
    const { body, headers } = val;

    return this.r2.put(key, body, { httpMetadata: headers }).then(() => {
      return;
    });
  }

  async delete(r: Request): Promise<boolean> {
    const key = this.cacheKey(r);
    const data = await this.r2.get(key);
    if (!data) {
      return false;
    }

    if ("body" in data) {
      return this.r2.delete(key).then(() => true);
    }

    return false;
  }
};

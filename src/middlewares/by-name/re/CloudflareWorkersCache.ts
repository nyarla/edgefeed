import type { Context } from "hono";
import type { ICacheInitializer } from "@/interfaces/ICache";

/**
 * The factory function for ICacheInitializer with Cloudflare Wokers caches object.
 */
export const createCloudflareWorkersCacheInitializer =
  (): ICacheInitializer => async (c: Context) => {
    const href = new URL(c.req.url);
    href.searchParams.sort();

    const path = href.pathname;
    const query = href.searchParams.toString();

    return caches.open(`response:${query === "" ? path : `${path}?${query}`}`);
  };

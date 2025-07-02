import { Hono } from "hono";

import type { Bindings as basicAuthBindings } from "@/middlewares/by-name/ba/basic-auth";
import type { Bindings as r2ResponseCacheBindings } from "@/middlewares/by-name/re/response-cache-r2";

import { middleware as basicAuthMiddleware } from "@/middlewares/by-name/ba/basic-auth";
import { middleware as responseCacheMiddleware } from "@/middlewares/by-name/re/response-cache";
import { middleware as r2ResponseCacheMiddleware } from "@/middlewares/by-name/re/response-cache-r2";

import { R2Cache } from "@/middlewares/by-name/re/response-cache-r2";

import { FLStudioNewsToJSONFeed } from "@/services/by-name/im/image-line/handlers";

type Bindings = {} & basicAuthBindings & r2ResponseCacheBindings;

const cacheOpener = (ns: string) => caches.open(`response:${ns}`);
const R2CacheOpener = (bucket: R2Bucket, duration: number) =>
  R2Cache(bucket, duration, (r: Request) => new URL(r.url).pathname);

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "*",
  basicAuthMiddleware(),
  responseCacheMiddleware(cacheOpener),
  r2ResponseCacheMiddleware(R2CacheOpener),
);

app.get(
  "/by-name/im/image-line/flstudio-news.json",
  FLStudioNewsToJSONFeed("https://customfeed.thotep.net"),
);

export default app;

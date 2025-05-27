import { Hono } from "hono";

import type { Bindings as basicAuthBindings } from "@/middlewares/by-name/ba/basic-auth";
import type { Bindings as r2ResponseCacheBindings } from "@/middlewares/by-name/re/response-cache-r2";

import { middleware as basicAuthMiddleware } from "@/middlewares/by-name/ba/basic-auth";
import { middleware as responseCacheMiddleware } from "@/middlewares/by-name/re/response-cache";
import { middleware as r2ResponseCacheMiddleware } from "@/middlewares/by-name/re/response-cache-r2";

import { R2Cache } from "@/middlewares/by-name/re/response-cache-r2";

import { circlePageToJSONFeed } from "@/services/by-name/me/melonbooks/handlers";

type Bindings = {} & basicAuthBindings & r2ResponseCacheBindings;

const cacheOpener = (ns: string) => caches.open(`response:${ns}`);
const R2CacheOpener = (bucket: R2Bucket, duration: number) =>
  R2Cache(bucket, duration, (r: Request) => {
    const href = new URL(r.url).pathname.split("/");
    return href[href.length - 1];
  });

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => c.text("Usage: /circle/:id"));

app.get(
  "/circle/:id",
  basicAuthMiddleware(),
  responseCacheMiddleware(cacheOpener),
  r2ResponseCacheMiddleware(R2CacheOpener),
  circlePageToJSONFeed("https://melon2feed.thotep.net/circle/"),
);

export default app;

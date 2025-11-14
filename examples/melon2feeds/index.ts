import { Hono, type Handler } from "hono";

import type { Bindings as basicAuthBindings } from "@/middlewares/by-name/ba/basic-auth";
import type { Bindings as r2ResponseCacheBindings } from "@/middlewares/by-name/re/response-cache-r2";

import { middleware as basicAuthMiddleware } from "@/middlewares/by-name/ba/basic-auth";
import { middleware as responseCacheMiddleware } from "@/middlewares/by-name/re/response-cache";
import { middleware as r2ResponseCacheMiddleware } from "@/middlewares/by-name/re/response-cache-r2";

import { R2Cache } from "@/middlewares/by-name/re/response-cache-r2";

import {
  circlePageToJSONFeed,
  newItemsPageToJSONFeed,
  rankingPageToJSONFeed,
} from "@/services/by-name/me/melonbooks/handlers";

type Bindings = {} & basicAuthBindings & r2ResponseCacheBindings;

const cacheOpener = (ns: string) => caches.open(`response:${ns}`);
const R2CacheOpener = (bucket: R2Bucket, duration: number) =>
  R2Cache(bucket, duration, (r: Request) => {
    const href = new URL(r.url).pathname.split("/");
    return href[href.length - 1];
  });

const app = new Hono<{ Bindings: Bindings }>();

const url = (path: string) => `https://melonfeed.thotep.net/${path}/`;
const get = (path: string, handler: Handler) =>
  app.get(
    path,
    basicAuthMiddleware(),
    responseCacheMiddleware(cacheOpener),
    r2ResponseCacheMiddleware(R2CacheOpener),
    handler,
  );

app.get("/", (c) => c.text(""));

get("/circle/:id", circlePageToJSONFeed(url("circle")));
get("/ranking/:category/:type", rankingPageToJSONFeed(url("ranking")));
get("/new/:category/:kind", newItemsPageToJSONFeed(url("new")));

export default app;

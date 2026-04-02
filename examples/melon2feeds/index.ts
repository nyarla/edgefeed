import { type Handler, Hono } from "hono";

import {
  type Bindings as basicAuthBindings,
  middleware as basicAuthMiddleware,
} from "@/middlewares/by-name/ba/basic-auth";
import {
  type CloudflareR2CacheBindings,
  createCloudflareR2CacheInitializer,
} from "@/middlewares/by-name/re/CloudflareR2Cache";
import { createCloudflareWorkersCacheInitializer } from "@/middlewares/by-name/re/CloudflareWorkersCache";
import { createResponseCacheMiddleware } from "@/middlewares/by-name/re/ResponseCache";

import {
  circlePageToJSONFeed,
  newItemsPageToJSONFeed,
  rankingPageToJSONFeed,
} from "@/services/by-name/me/melonbooks/handlers";

type Bindings = {} & basicAuthBindings & CloudflareR2CacheBindings;

const app = new Hono<{ Bindings: Bindings }>();
const basicAuth = basicAuthMiddleware();
const cloudflareWorkersCache = createResponseCacheMiddleware(
  createCloudflareWorkersCacheInitializer(),
);
const cloudflareR2Cache = createResponseCacheMiddleware(
  createCloudflareR2CacheInitializer(),
);

app.get("/", (c) => c.text("ok"));

const get = (
  ns: string,
  path: string,
  createHandler: (baseUrl: string, userAgnet?: string) => Handler,
) => {
  app.get(
    path,
    basicAuth,
    cloudflareWorkersCache,
    cloudflareR2Cache,
    createHandler(`https://melonfeed.thotep.net/${ns}/`),
  );
};

get("circle", "/circle/:id", circlePageToJSONFeed);
get("ranking", "/ranking/:category/:type", rankingPageToJSONFeed);
get("new", "/new/:category/:kind", newItemsPageToJSONFeed);

export default app;

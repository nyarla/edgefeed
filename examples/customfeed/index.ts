import { Hono } from "hono";

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

import { FLStudioNewsToJSONFeed } from "@/services/by-name/im/image-line/handlers";

type Bindings = {} & basicAuthBindings & CloudflareR2CacheBindings;

const app = new Hono<{ Bindings: Bindings }>();
const basicAuth = basicAuthMiddleware();
const cloudflareWorkersCache = createResponseCacheMiddleware(
  createCloudflareWorkersCacheInitializer(),
);
const cloudflareR2Cache = createResponseCacheMiddleware(
  createCloudflareR2CacheInitializer(),
);

app.use("*", basicAuth, cloudflareWorkersCache, cloudflareR2Cache);

app.get(
  "/by-name/im/image-line/flstudio-news.json",
  FLStudioNewsToJSONFeed("https://customfeed.thotep.net"),
);

export default app;

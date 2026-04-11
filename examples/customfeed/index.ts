import { Hono } from "hono";
import { createAuthenticateMiddleware } from "@/middlewares/by-name/au/Authentication";
import {
  createTokenAuthenticator,
  type TokenAuthBindings,
} from "@/middlewares/by-name/au/TokenAuth";
import {
  type CloudflareR2CacheBindings,
  createCloudflareR2CacheInitializer,
} from "@/middlewares/by-name/re/CloudflareR2Cache";
import { createCloudflareWorkersCacheInitializer } from "@/middlewares/by-name/re/CloudflareWorkersCache";
import { createResponseCacheMiddleware } from "@/middlewares/by-name/re/ResponseCache";
import {
  createHonoHandler,
  type HanlderOptions,
} from "@/services/by-name/im/image-line/HonoHandler";

type Bindings = {} & TokenAuthBindings & CloudflareR2CacheBindings;

const app = new Hono<{ Bindings: Bindings }>();
const tokenAuth = createAuthenticateMiddleware(createTokenAuthenticator());

const cloudflareWorkersCache = createResponseCacheMiddleware(
  createCloudflareWorkersCacheInitializer(),
);

const cloudflareR2Cache = createResponseCacheMiddleware(
  createCloudflareR2CacheInitializer(),
);

const commonHanlderOptions: HanlderOptions = {
  baseUrl: "https://customfeed.thotep.net",
  format: "atom",
  open: createCloudflareWorkersCacheInitializer(),
};

app.use("*", tokenAuth, cloudflareWorkersCache, cloudflareR2Cache);
app.get(
  "/by-name/im/image-line/flstudio-news.atom",
  createHonoHandler(commonHanlderOptions),
);

export default app;

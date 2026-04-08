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
  type HanderOptions,
} from "@/services/by-name/me/melonbooks/HonoHandlers";

type Bindings = {} & CloudflareR2CacheBindings & TokenAuthBindings;

const app = new Hono<{ Bindings: Bindings }>();

const tokenAuth = createAuthenticateMiddleware(createTokenAuthenticator());

const cloudflareWorkersCache = createResponseCacheMiddleware(
  createCloudflareWorkersCacheInitializer(),
);

const cloudflareR2Cache = createResponseCacheMiddleware(
  createCloudflareR2CacheInitializer(),
);

app.get("/", (c) => c.text("ok"));

type kind = "circle" | "ranking" | "news";

const options = (kind: kind): HanderOptions => ({
  baseUrl: `https://melonfeed.thotep.net/${kind}/`,
  kind,
  format: "atom",
  open: createCloudflareR2CacheInitializer(),
});

const handleAtom = (path: string, kind: kind) =>
  app.get(
    path,
    tokenAuth,
    cloudflareWorkersCache,
    cloudflareR2Cache,
    createHonoHandler(options(kind)),
  );

handleAtom("/circle/:id/atom", "circle");
handleAtom("/ranking/:kind/:id/atom", "ranking");
handleAtom("/new/:kind/:type/atom", "news");

export default app;

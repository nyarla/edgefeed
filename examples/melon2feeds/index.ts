import { Hono, type Context } from "hono";

// Cache
import type { CacheInterface } from "@/Cache/Cache";
import {
  CloudflareR2Cache,
  CloudflareR2CacheBindings,
} from "@/Cache/CloudflareR2Cache";

// Auth
import { createAuthenticateMiddleware } from "@/middlewares/by-name/au/Authentication";
import {
  createTokenAuthenticator,
  type TokenAuthBindings,
} from "@/middlewares/by-name/au/TokenAuth";

// Handlers
import { melonbooks } from "@/Feeds/Melonbooks/HonoHandlers";
import {
  createCirclePageRequest,
  createReserveRankingRequest,
  createArrivalsRankingRequest,
  createNewArrivalItemsRequest,
  createNewReserveItemsRequest,
} from "@/Feeds/Melonbooks/Requests";
import { AtomFeedRenderer as renderer } from "@/Feeds/Melonbooks/AtomFeedRenderer";

// Middleware
const tokenAuth = createAuthenticateMiddleware(createTokenAuthenticator());

// Application
const open = (c: Context, ns: string): CacheInterface =>
  new CloudflareR2Cache(c, ns);

const contentType = "application/atom+xml" as const;
const userAgent =
  "Mozilla/5.0 (X11; Linux x86_64; rv:151.0) Gecko/20100101 Firefox/151.0" as const;

type Bindings = {} & CloudflareR2CacheBindings & TokenAuthBindings;

const app = new Hono<{ Bindings: Bindings }>();

const atom = (
  path: string,
  createMelonbooksRequest: (id: string | number, userAgent: string) => Request,
) =>
  app.get(
    path,
    tokenAuth,
    melonbooks({
      userAgent,
      contentType,
      createMelonbooksRequest,
      renderer,
      open,
    }),
  );

app.get("/", (c) => c.text("ok"));

atom("/circle/:id/atom", createCirclePageRequest);

atom("/ranking/:id/1/atom", createReserveRankingRequest);
atom("/ranking/:id/2/atom", createArrivalsRankingRequest);

atom("/new/:id/new/atom", createNewArrivalItemsRequest);
atom("/new/:id/reserve/atom", createNewReserveItemsRequest);

export default app;

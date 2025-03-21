import type { Context, Next } from "hono";
import { basicAuth } from "hono/basic-auth";

/** The environment variables bindings for this middleware.
 */
export type Bindings = {
  /**
   * The value of basic auth is turned off
   * If this value has `off` as string, this middleware pass through of basic authorization.
   */
  EDGEFEED_BASIC_AUTH?: string;

  /**
   * The username for basic auth.
   */
  EDGEFEED_USERNAME?: string;
  /**
   * The password for basic auth.
   */
  EDGEFEED_PASSWORD?: string;
};

/**
 * The basic auth middleware for edgefeed.
 *
 * @example
 * ```ts
 * import { type Bindings, middleware as basicAuth } from '{edgefeed}/middlewares/by-name/ba/basicAuth';
 * import { Hono } from 'hono'
 *
 * const app = new Hono<{Bindings: Bindings}>();
 *
 * app.use('/', basicAuth())
 *
 * export default app;
 * ```
 */
export const middleware = () => async (c: Context, next: Next) => {
  // if this value has `off`, this middleware pass through of basic auth.
  if (c.env.EDGEFEED_BASIC_AUTH === "off") {
    await next();
    return;
  }

  const authenticator = basicAuth({
    username: c.env.EDGEFEED_USERNAME,
    password: c.env.EDGEFEED_PASSWORD,
  });

  await authenticator(c, next);
  return;
};

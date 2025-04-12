import type { Context, Next, MiddlewareHandler } from "hono";
import { basicAuth } from "hono/basic-auth";

/**
 * The bindings for Hono with basic-auth middleware.
 */
export type Bindings = {
  /**
   * The toggle for basic-auth middleware is off.
   *
   * If this value is `off`, basic-auth middleware is turned off.
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
 * This middleware provides basic auth for edgefeed,
 * and it support single user.
 *
 * @returns - the basic auth middleware for Hono.
 *
 * @example
 * ```ts
 * import { Hono } from 'hono';
 * import { type Bindings, middleware as basicAuth } from '@/middlewares/by-name/ba/basic-auth';
 *
 * const app = new Hono<{ Bindings: Bindings }>();
 *
 * app.use('/', basicAuth());
 *
 * export default app;
 * ```
 */
export const middleware =
  (): MiddlewareHandler => async (c: Context, next: Next) => {
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

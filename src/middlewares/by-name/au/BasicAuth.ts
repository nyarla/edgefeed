import type { Context, MiddlewareHandler, Next } from "hono";
import { basicAuth } from "hono/basic-auth";

/**
 * The Hono bindings for basic auth middleware.
 *
 */
export type BasicAuthBindings = {
  /**
   * The username for basic auth
   */
  EDGEFEED_BASIC_AUTH_USERNAME: string;
  /**
   *
   * The password for basic auth.
   */
  EDGEFFED_BASIC_AUTH_PASSWORD: string;
};

/**
 * The function to instantiate basic auth middleware.
 *
 * This middleware bridges Bindings to hono's basic-auth middleware.
 *
 * @returns {MiddlewareHandler} the Hono's middleware handler.
 */
export const createBasicAuthMiddleware =
  (): MiddlewareHandler => async (c: Context, next: Next) => {
    const authentiator = basicAuth({
      username: c.env.EDGEFEED_BASIC_AUTH_USERNAME,
      password: c.env.EDGEFEED_BASIC_AUTH_PASSWORD,
    });

    await authentiator(c, next);
    return;
  };

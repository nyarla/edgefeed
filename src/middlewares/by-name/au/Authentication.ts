import type { Context, MiddlewareHandler, Next } from "hono";
import { HTTPException } from "hono/http-exception";

/**
 * The interface of Authenticator.
 *
 * This interface receives Hono's Context. and returns to Promise<booelan> result.
 *
 * If this implementation of this interface returns true, that means authentication is passed,
 * or return false, it means to authentication failed.
 */
export type Authenticator = (c: Context) => Promise<boolean>;

/**
 * The functions to instantiate authentication middleware.
 *
 * @param {Authenticator} auth - the Authenticator function.
 * @returns {MiddlewareHandler} Hono's Middleware handler.
 */
export const createAuthenticateMiddleware =
  (auth: Authenticator): MiddlewareHandler =>
  async (c: Context, next: Next) => {
    if (!(await auth(c))) {
      throw new HTTPException(401, {
        message: "this page requires authentication.",
      });
    }
    await next();
  };

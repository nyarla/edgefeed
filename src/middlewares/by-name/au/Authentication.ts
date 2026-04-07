import type { Context, MiddlewareHandler, Next } from "hono";
import { HTTPException } from "hono/http-exception";

export type Authenticator = (c: Context) => Promise<boolean>;

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

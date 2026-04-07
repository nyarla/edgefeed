import type { Context, MiddlewareHandler, Next } from "hono";
import { basicAuth } from "hono/basic-auth";

export type BasicAuthBindings = {
  EDGEFEED_BASIC_AUTH_USERNAME: string;
  EDGEFFED_BASIC_AUTH_PASSWORD: string;
};

export const createBasicAuthMiddleware =
  (): MiddlewareHandler => async (c: Context, next: Next) => {
    const authentiator = basicAuth({
      username: c.env.EDGEFEED_BASIC_AUTH_USERNAME,
      password: c.env.EDGEFEED_BASIC_AUTH_PASSWORD,
    });

    await authentiator(c, next);
    return;
  };

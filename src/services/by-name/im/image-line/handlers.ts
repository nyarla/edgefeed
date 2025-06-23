import type { Context, Handler } from "hono";
import { HTTPException } from "hono/http-exception";

import { transformToJSONFeed } from "./parse";
import { makeFLStudioNewRequest } from "./request";

export const FLStudioNewsToJSONFeed =
  (baseUrl: string, userAgent?: string): Handler =>
  async (c: Context) => {
    const request = makeFLStudioNewRequest(userAgent);
    const response = await fetch(request);

    if (!response?.ok) {
      throw new HTTPException(500, {
        message: `failed to fetch flstudio-news page: ${await response.text()}`,
      });
    }

    return c.body(await transformToJSONFeed(response, baseUrl), 200, {
      "Content-Type": "application/feed+json; charset=utf-8",
    });
  };

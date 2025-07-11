import type { Context, Handler } from "hono";
import { HTTPException } from "hono/http-exception";

import { transformToJSONFeed } from "./parse";
import { makeFLStudioNewRequest } from "./request";

/**
 * Make `Hono` handler for transform flstudio-news page to JSON feed.
 *
 * @param {string} baseUrl - the string of base URL on JSON feed.
 * @param {string?} userAgent - the custom User-Agent string to fetch content.
 * @returns {Handler}-- the Hono handler.
 */
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

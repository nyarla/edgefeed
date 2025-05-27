import type { Context, Handler } from "hono";
import { HTTPException } from "hono/http-exception";

import { transformToJSONFeed } from "./parse";
import { makeCirclePageRequest } from "./request";

/**
 * Make `Hono` handler for transform melonbooks's circle page to JSON Feed.
 *
 * @param {string} baseUrl - the base URL of JSON Feed.
 * @param {string?} userAgent - the User-Agent string for `fetch` api. this is optional.
 * @returns {Handler} - the Hono handler.
 */
export const circlePageToJSONFeed =
  (baseUrl: string, userAgent?: string): Handler =>
  async (c: Context) => {
    const id = c.req.param("id");
    if (id.match(/[^0-9]/)) {
      throw new HTTPException(400, {
        message: "circle id should be the number",
      });
    }

    const request = makeCirclePageRequest(id, userAgent);
    const response = await fetch(request);

    if (!response?.ok) {
      throw new HTTPException(500, {
        message: `failed to fetch melonbooks circle page: ${await response.text()}`,
      });
    }

    return c.body(await transformToJSONFeed(response, baseUrl), 200, {
      "Content-Type": "application/feed+json; charset=utf-8",
    });
  };

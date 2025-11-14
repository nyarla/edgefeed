import type { Context, Handler } from "hono";
import { HTTPException } from "hono/http-exception";

import { transformToJSONFeed } from "./parse";
import {
  makeCirclePageRequest,
  makeNewItemsPageRequest,
  makeRankingPageRequest,
} from "./request";

/**
 * Make `Hono` handler for transform melonbooks's circle page to JSON Feed.
 *
 * @param {string} baseUrl - the base URL of JSON Feed.
 * @param {string?} userAgent - the User-Agent string for `fetch` api. this is optional.
 * @returns {Handler} - the Hono handler.
 */
export const circlePageToJSONFeed =
  (baseUrl: string, userAgent?: string): Handler =>
  /* oxlint-disable */
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

/**
 * Make the `Hono` handler for transform the ranking page to jsonfeed.
 *
 * @param {string} baseUrl - the base URL of JSON Feed.
 * @param {string?} userAgent - the User-Agent string for fetching remote content.
 * @returns {Handler} - the Hono handler.
 */
export const rankingPageToJSONFeed =
  (baseUrl: string, userAgent?: string): Handler =>
  /* oxlint-disable */
  async (c: Context) => {
    const category = c.req.param("category");
    if (category?.match(/[^0-9]/)) {
      throw new HTTPException(400, {
        message: "The category id should be a number",
      });
    }

    const typ = c.req.param("type");
    if (typ?.match(/[^0-9]/)) {
      throw new HTTPException(400, {
        message: "The type id should be a number",
      });
    }

    const request = makeRankingPageRequest(
      Number.parseInt(typ, 10),
      Number.parseInt(category, 10),
      userAgent,
    );
    const response = await fetch(request);

    if (!response?.ok) {
      throw new HTTPException(500, {
        message: `failed to fetch the melonbooks ranking page: ${await response.text()}`,
      });
    }

    return c.body(await transformToJSONFeed(response, baseUrl), 200, {
      "Content-Type": "application/feed+json; charset=utf-8",
    });
  };

/**
 * Make the `Hono` handler for transform new items pages to jsonfeed.
 *
 * @param {string} baseUrl - the base URL of jsonfeed.
 * @param {string?} userAgent - the User-Agent string for fetch remote content.
 * @returns {Handler} - the Hono handler.
 **/
export const newItemsPageToJSONFeed =
  (baseUrl: string, userAgent?: string): Handler =>
  /* oxlint-disable */
  async (c: Context) => {
    const category = c.req.param("category");
    if (category?.match(/[^0-9]/)) {
      throw new HTTPException(400, {
        message: "The category id should be a number",
      });
    }

    const kind = c.req.param("kind");
    switch (kind) {
      case "reserve":
      case "new":
        // nothing to do.
        break;

      default:
        throw new HTTPException(400, {
          message: `The 'kind' of page should be a 'reserve' or 'new', but this value is: ${kind}`,
        });
    }

    const request = makeNewItemsPageRequest(
      kind,
      Number.parseInt(category, 10),
      userAgent,
    );
    const response = await fetch(request);

    if (!response?.ok) {
      throw new HTTPException(500, {
        message: `failed to fetch the melonbooks ranking page: ${await response.text()}`,
      });
    }

    return c.body(await transformToJSONFeed(response, baseUrl), 200, {
      "Content-Type": "application/feed+json; charset=utf-8",
    });
  };

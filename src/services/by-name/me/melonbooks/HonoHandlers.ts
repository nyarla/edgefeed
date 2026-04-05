import type { Context, Handler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ICacheInitializer } from "@/interfaces/ICache";
import { AtomFeedEmitter } from "./AtomFeedEmitter";
import { HTMLRewriterTransformer } from "./HTMLRewriterTransformer";
import { JSONFeedEmitter } from "./JSONFeedEmitter";
import {
  createCirclePageRequest,
  createNewItemsRequest,
  createRankingPageRequest,
} from "./Request";

/***
 * The type of options for Hono handler.
 */
export type HanderOptions = {
  /**
   * The base url for generated feed.
   */
  baseUrl: string;
  /**
   * The kind of page type on melonbooks.
   *
   * This value assign to these values:
   *
   * - circle: the circle page
   * - ranking: the ranking page
   * - news: the new items page
   */
  kind: "circle" | "ranking" | "news";
  /**
   * The format of feed.
   *
   * At the moment, this value supported to "json" or "atom".
   */
  format: "json" | "atom";
  /**
   * `ICacheInitializer` object for response cache from melonbooks
   */
  open: ICacheInitializer;

  /**
   * The custom User-Agent string. this is optional.
   */
  userAgent?: string;
};

/**
 * Create the Hoho handler by HandlerOptions.
 *
 * This function supports to make three handlers with the some path parameters,
 * and that requires to working Hono handlers:
 *
 * - kind: `circle`
 *   - `id`: the id of circle page. this value shoulde be the number
 * - kind: `ranking`
 *   - `kind`: the kind of ranking page. this value should be the number
 *   - `id`: the category id of ranking page. this value should be the number
 * - kind: `news`
 *   - `kind`: the kind of new items page. this value should be the string of `reserve` or `new`.
 *   - `id`: the category id of new items page. this value should be the number
 *
 * @param {HandlerOptions} the options to make Hono handler.
 * @returns {Handler} the Hono handler.
 */
export const createHonoHandler =
  ({ baseUrl, kind, format, open, userAgent }: HanderOptions): Handler =>
  async (c: Context) => {
    let request: Request | null = null;

    switch (kind) {
      case "circle": {
        const id = c.req.param("id");
        if (!id || id?.match(/[^0-9]/)) {
          throw new HTTPException(400, {
            message: `the circle id is not number: ${id}`,
          });
        }

        request = createCirclePageRequest(id, userAgent);

        break;
      }

      case "ranking": {
        const kind = c.req.param("kind");
        if (!kind || kind?.match(/[^0-9]/)) {
          throw new HTTPException(400, {
            message: `the ranking category id is not number: ${kind}`,
          });
        }

        const id = c.req.param("id");
        if (!id || id?.match(/[^0-9]/)) {
          throw new HTTPException(400, {
            message: `the ranking type id is not number: ${id}`,
          });
        }

        request = createRankingPageRequest(
          Number.parseInt(kind, 10),
          Number.parseInt(id, 10),
          userAgent,
        );

        break;
      }

      case "news": {
        const kind = c.req.param("kind");
        if (!kind || kind?.match(/[^0-9]/)) {
          throw new HTTPException(400, {
            message: `the category id is not number: ${kind}`,
          });
        }

        const typ = c.req.param("type");
        switch (typ) {
          case "reserve":
          case "new": {
            request = createNewItemsRequest(
              typ,
              Number.parseInt(kind, 10),
              userAgent,
            );
            break;
          }

          default: {
            throw new HTTPException(400, {
              message: `the type of new items does not match to 'reserve' or 'new': ${typ}`,
            });
          }
        }

        break;
      }

      default: {
        throw new HTTPException(500, {
          message: `Unsupported handler kind: ${kind}`,
        });
      }
    }

    let response: Response | undefined;
    let useCache = true;

    const cache = await open(c);

    response = await cache.match(request);
    if (!response) {
      useCache = false;
      response = await fetch(request);
    }

    if (!response?.ok) {
      switch (response.status) {
        case 404:
        case 410: {
          throw new HTTPException(404, {
            message: "the requested item is not found.",
          });
        }

        case 500:
        case 502:
        case 503:
        case 504: {
          throw new HTTPException(503, {
            message: "the request to melonbooks doesn't reached out.",
          });
        }

        default: {
          throw new HTTPException(500, {
            message: `the unsupported response: ${response.status}`,
          });
        }
      }
    }

    if (!useCache) {
      const data = response.clone();
      try {
        c.executionCtx.waitUntil(cache.put(request, data));
      } catch (_) {
        await cache.put(request, data);
      }
    }

    const emitter =
      format === "json"
        ? new JSONFeedEmitter(baseUrl)
        : new AtomFeedEmitter(baseUrl);

    const contentType =
      format === "json"
        ? "application/feed+json; charset=utf-8"
        : "application/atom+xml; charset=utf-8";

    const transformer = new HTMLRewriterTransformer(emitter);

    return c.body(await transformer.parse(response.clone()), 200, {
      "Content-Type": contentType,
    });
  };

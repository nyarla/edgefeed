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

export type HanderOptions = {
  baseUrl: string;
  kind: "circle" | "ranking" | "news";
  format: "json" | "atom";
  open: ICacheInitializer;
  userAgent?: string;
};

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

import type { Context, Handler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ICacheInitializer } from "@/interfaces/ICache";

import { AtomFeedEmitter } from "./AtomFeedEmitter";
import { HTMLRewriterTransformer } from "./HTMLRewriterTransformer";
import { JSONFeedEmitter } from "./JSONFeedEmitter";
import { createFLStudioNewRequest } from "./Request";

export type HanlderOptions = {
  baseUrl: string;
  format: "json" | "atom";
  open: ICacheInitializer;
  userAgent?: string;
};

export const createHonoHandler =
  ({ baseUrl, format, open, userAgent }: HanlderOptions): Handler =>
  async (c: Context) => {
    const request = createFLStudioNewRequest(userAgent);

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
            message: "the requested url is not foundi.",
          });
        }

        case 500:
        case 502:
        case 503:
        case 504: {
          throw new HTTPException(503, {
            message: "the request to image-line website doesn't reached out.",
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

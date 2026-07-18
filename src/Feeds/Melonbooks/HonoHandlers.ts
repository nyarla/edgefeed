import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { CacheInterface } from "@/Cache/Cache";
import { Emitter, type Renderer } from "@/Common/Emitter";
import { normalize } from "@/Common/JSON";
import { ParserContext } from "@/Common/ParserContext";
import { createFilteredRenderer, type Filter } from "@/Common/Renderer";
import { Transformer } from "@/Common/Transformer";
import { configs } from "./Configs";
import type {
  InScopeIndexedPartialItems,
  Item,
  PartialItem,
  Prop,
  Scope,
  Value,
} from "./Types";

export type MelonbooksHandlerOptions = {
  userAgent: string;
  contentType: string;
  renderer: Renderer<InScopeIndexedPartialItems>;
  createMelonbooksRequest: (id: string, userAgent: string) => Request;
  open: (c: Context, ns: string) => CacheInterface;
};

export const melonbooks =
  ({
    userAgent,
    contentType,
    renderer,
    createMelonbooksRequest,
    open,
  }: MelonbooksHandlerOptions) =>
  async (c: Context) => {
    const id = c.req.param("id");
    if (!id) {
      throw new HTTPException(400, {
        message: `The parameter 'id' is not specified.`,
      });
    }

    const finalizeTasks = [];

    const req = createMelonbooksRequest(id, userAgent);
    let res!: Response;

    const fetchResponseCache = open(c, "MelonbooksFetchResponse");
    const cachedFetchResponse = await fetchResponseCache.match(req);

    if (cachedFetchResponse?.ok) {
      res = cachedFetchResponse;
    }

    if (!res) {
      res = await fetch(req);

      if (res?.ok && res.status === 200) {
        const data = new Response(await res.clone().arrayBuffer(), {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        });

        finalizeTasks.push(fetchResponseCache.put(req, data));
      }
    }

    if (!res.ok) {
      switch (res.status) {
        case 404:
        case 410: {
          throw new HTTPException(404, {
            message: "The requested page is not found.",
          });
        }

        case 500:
        case 502:
        case 503:
        case 504: {
          throw new HTTPException(503, {
            message: "The remote server is temporarily unavailable.",
          });
        }

        default: {
          throw new HTTPException(500, {
            message: `Unsupported response code: ${res.statusText}`,
          });
        }
      }
    }

    const deduplicateCache = open(c, "MelonbooksDeduplicate");
    let deduplicateMap!: Map<string, string>;

    try {
      const data = await (await deduplicateCache.match(req))?.text();

      if (data) {
        deduplicateMap = new Map<string, string>(JSON.parse(data));
      } else {
        deduplicateMap = new Map<string, string>();
      }
    } catch (err: unknown) {
      console.error(err);

      deduplicateMap = new Map<string, string>();
      await deduplicateCache.delete(req);
    }

    const isUnique: Filter<Scope, Prop, Value> = {
      filter: (scope: Scope, _: number, item: PartialItem): boolean => {
        if (scope !== "product") {
          return true;
        }

        const { productId, productSalesStatus } = item;
        if (!productId || !productSalesStatus) {
          return true;
        }

        if ((deduplicateMap.get(productId) ?? "") === productSalesStatus) {
          return false;
        }

        deduplicateMap.set(productId, productSalesStatus);
        return true;
      },
    };

    const proxy = createFilteredRenderer<Scope, Prop, Value>(
      renderer,
      isUnique,
    );
    const emitter = new Emitter<Scope, Item>({ renderer: proxy });
    const pc = new ParserContext<Scope>("global");

    emitter.set("global", 0, { feedUrl: c.req.url });

    const transformer = new Transformer<Scope, Prop>(emitter, pc, configs);
    const feed = await transformer.transform(res);

    let payload = "[";
    let idx = 0;
    for (const [id, status] of deduplicateMap) {
      if (idx !== 0) {
        payload += ",";
      }

      payload += `["${normalize(id)}", "${normalize(status)}"]`;
      idx++;
    }
    payload += "]";

    const data = new Response(new TextEncoder().encode(payload), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    finalizeTasks.push(deduplicateCache.put(req, data));

    if (c?.executionCtx?.waitUntil) {
      c.executionCtx.waitUntil(Promise.all(finalizeTasks));
    } else {
      await Promise.all(finalizeTasks);
    }

    return c.body(feed, 200, { "Content-Type": contentType });
  };

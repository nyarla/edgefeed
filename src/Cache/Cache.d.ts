import { Context } from "hono";

export interface CachesConstructor {
  new (c: Context, ns: string): Caches;
}

export interface CacheInterface {
  match: (key: Request) => Promise<Response | undefined>;
  put: (key: Request, val: Response) => Promise<void>;
  delete: (key: Request) => Promise<boolean>;
}

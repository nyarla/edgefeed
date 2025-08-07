import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";
import { resolve } from "node:path";

export default defineWorkersConfig({
  test: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
    poolOptions: {
      workers: {
        wrangler: {
          configPath: "./wrangler.jsonc",
        },
        miniflare: {
          r2Buckets: ["EDGEFEED_R2_CACHE_BUCKET"],
        },
      },
    },
  },
});

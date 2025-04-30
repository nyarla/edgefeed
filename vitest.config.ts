import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
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

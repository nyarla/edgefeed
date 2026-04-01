import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  test: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    cloudflareTest({
      wrangler: {
        configPath: "./wrangler.jsonc",
      },
      miniflare: {
        r2Buckets: ["EDGEFEED_R2_CACHE_BUCKET"],
      },
    }),
  ],
});

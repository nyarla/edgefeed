declare module "cloudflare:test" {
  interface ProvidedEnv {
    EDGEFEED_R2_CACHE_BUCKET: R2Bucket;
    EDGEFEED_R2_CACHE_DURATION: number;
  }
}

import { FirefoxForLinuxUserAgent as defaultFallbackUserAgent } from "@/lib/const";

export const FLStudioNewsURL = "https://www.image-line.com/news";

export const createFLStudioNewRequest = (userAgent?: string): Request => {
  const UA = userAgent ?? defaultFallbackUserAgent;
  return new Request(FLStudioNewsURL, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": UA,
    },
  });
};

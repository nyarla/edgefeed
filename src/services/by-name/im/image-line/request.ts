import { FirefoxForLinuxUserAgent as defaultDummyUserAgent } from "@/lib/const";

/**
 * The string of flstudio-news url.
 */
export const FLStudioNewsUrl = "https://www.image-line.com/fl-studio-news";

/**
 *  make the `Request` object for fetching to flstudio-news.
 *
 *  @param {string?} userAgent - the custom User-Agent string.
 *  @returns {Request} - the `Request` object for `fetch` api.
 */
export const makeFLStudioNewRequest = (userAgent?: string): Request => {
  const dummaryUserAgent = userAgent ?? defaultDummyUserAgent;
  const request = new Request(FLStudioNewsUrl, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": dummaryUserAgent,
    },
  });

  return request;
};

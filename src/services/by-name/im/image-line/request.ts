/**
 * The string of flstudio-news url.
 */
export const FLStudioNewsUrl = "https://www.image-line.com/fl-studio-news";

const defaultDummyUserAgent =
  "Mozilla/5.0 (X11; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0";

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

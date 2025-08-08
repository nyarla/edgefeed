import { FirefoxForLinuxUserAgent as defaultDummyUserAgent } from "@/lib/const";

/**
 * Make the `Request` object for fethcing melonbooks's circle page.
 *
 * @param {string} id - the circle id on melonbooks.
 * @param {string?} userAgent - the User-Agent string. this is optional.
 * @returns {Request} - the `Request` object for `fetch` api.
 */
export const makeCirclePageRequest = (
  id: string,
  userAgent?: string,
): Request => {
  const href = `https://www.melonbooks.co.jp/circle/index.php?circle_id=${id}`;
  const dummyUserAgent = userAgent || defaultDummyUserAgent;
  const request = new Request(href, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": dummyUserAgent,
      Cookie: "AUTH_ADULT=1",
    },
  });

  return request;
};

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

/**
 * Make a `Request` object for fetching from melonbook's ranking page.
 *
 * @param {number} kind - the type of items on ranking page.
 * @param {number} category - the category id on melonbooks shopping items.
 * @param {string?} userAgent - the user-agent string for request.
 * @returns {Request} - the `Request` object for fethcing from melonbooks's ranking page.
 */
export const makeRankingPageRequest = (
  kind: number,
  category: number,
  userAgent?: string,
): Request => {
  const href = `https://www.melonbooks.co.jp/ranking/index.php?period=1&type=${kind}&mode=category&category=${category}`;
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

/**
 * The kind of new items on melonbooks shopping service.
 *
 * The acceptable values of this type are `reserve` or `new`.
 */
export type Kind = "reserve" | "new";

/**
 * Make a `Request` object for fetching from melonbooks's new items pages.
 *
 * @param {Kind} kind - the kind of new items.
 * @param {number} category - the category id on melonbooks shoppoing service.
 * @param {string?} userAgent - the user-agent string of fetching request.
 * @returns {Request} - the `Request` object for fetching new items page from melonbooks.
 */
export const makeNewItemsPageRequest = (
  kind: Kind,
  category: number,
  userAgent?: string,
): Request => {
  const href = `https://www.melonbooks.co.jp/${kind === "new" ? "new/arrival" : `${kind}/${kind}`}.php?sort_type=0&category=${category}`;
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

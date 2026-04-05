import { FirefoxForLinuxUserAgent as defaultUserAgent } from "@/lib/const";

/**
 * Create the Request object for melonbooks pagegs
 *
 * @param {string} href - the melonbooks page.
 * @param {string?} userAgent - the custom User-Agent.
 * @returns {Request} the Request object.
 */
export const createRequest = (href: string, userAgent?: string): Request =>
  new Request(href, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": userAgent ?? defaultUserAgent,
      Cookie: "AUTH_ADULT=1",
    },
  });

/**
 * Create the Request object for circle page on melonbooks.
 *
 * @param {string} id - the cirlce id on melonbooks,
 * @param {string?} userAgent - the custom User-Agent.
 * @returns {Request} the Request object for melonbooks cricle page.
 */
export const createCirclePageRequest = (
  id: string,
  userAgent?: string,
): Request =>
  createRequest(
    `https://www.melonbooks.co.jp/circle/index.php?circle_id=${id}`,
    userAgent,
  );

/**
 * Create the Request object for melonbooks ranking page.
 *
 * @param {number} kind - the type of ranking page.
 * @param {number} category - the id of category.
 * @param {string?} userAgent - the custom User-Agent.
 * @returns {Request} the Request object for melonbooks ranking page.
 */
export const createRankingPageRequest = (
  kind: number,
  category: number,
  userAgent?: string,
): Request =>
  createRequest(
    `https://www.melonbooks.co.jp/ranking/index.php?period=1&type=${kind}&mode=category&category=${category}`,
    userAgent,
  );

/**
 * Create the Request object for melonbooks new items pages.
 *
 * @param {"reserve"|"new"} kind - the kind of new items.
 * @param {number} category - the id of category.
 * @param {string?} userAgent - the custom User-Agent.
 * @returns {Request} the Request object for new items pages.
 */
export const createNewItemsRequest = (
  kind: "reserve" | "new",
  category: number,
  userAgent?: string,
): Request =>
  createRequest(
    `https://www.melonbooks.co.jp/${kind === "new" ? "new/arrival" : `${kind}/${kind}`}.php?sort_type=0&category=${category}`,
    userAgent,
  );

const defaultDummyUserAgent =
  "Mozilla/5.0 (X11; Linux x86_64; rv:135.0) Gecko/20100101 Firefox/135.0";

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

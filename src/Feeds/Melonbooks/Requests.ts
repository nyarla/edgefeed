export const createRequest = (href: string, UA: string): Request =>
  new Request(href, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": UA,
      Cookie: "AUTH_ADULT=1",
    },
  });

export const createCirclePageRequest = (
  id: string | number,
  UA: string,
): Request =>
  createRequest(
    `https://www.melonbooks.co.jp/circle/index.php?circle_id=${id}`,
    UA,
  );

export const createNewReserveItemsRequest = (
  categoryId: string | number,
  UA: string,
): Request =>
  createRequest(
    `https://www.melonbooks.co.jp/reserve/reserve.php?sort_type=0&category=${categoryId}`,
    UA,
  );

export const createNewArrivalItemsRequest = (
  categoryId: string | number,
  UA: string,
): Request =>
  createRequest(
    `https://www.melonbooks.co.jp/new/arrival.php?sort_type=0&category=${categoryId}`,
    UA,
  );

export const createReserveRankingRequest = (
  categoryId: string | number,
  UA: string,
): Request =>
  createRequest(
    `https://www.melonbooks.co.jp/ranking/index.php?period=1&type=2&mode=category&category=${categoryId}`,
    UA,
  );

export const createArrivalsRankingRequest = (
  categoryId: string | number,
  UA: string,
): Request =>
  createRequest(
    `https://www.melonbooks.co.jp/ranking/index.php?period=1&type=1&mode=category&category=${categoryId}`,
    UA,
  );

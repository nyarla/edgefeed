import { FirefoxForLinuxUserAgent as defaultUserAgent } from "@/lib/const";

export const createRequest = (href: string, userAgent?: string) =>
  new Request(href, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": userAgent ?? defaultUserAgent,
      Cookie: "AUTH_ADULT=1",
    },
  });

export const createCirclePageRequest = (id: string, userAgent?: string) =>
  createRequest(
    `https://www.melonbooks.co.jp/circle/index.php?circle_id=${id}`,
    userAgent,
  );

export const createRankingPageRequest = (
  kind: number,
  category: number,
  userAgent?: string,
) =>
  createRequest(
    `https://www.melonbooks.co.jp/ranking/index.php?period=1&type=${kind}&mode=category&category=${category}`,
    userAgent,
  );

export const createNewItemsRequest = (
  kind: "reserve" | "new",
  category: number,
  userAgent?: string,
) =>
  createRequest(
    `https://www.melonbooks.co.jp/${kind === "new" ? "new/arrival" : `${kind}/${kind}`}.php?sort_type=0&category=${category}`,
    userAgent,
  );

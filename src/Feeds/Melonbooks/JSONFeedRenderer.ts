import type { Renderer } from "@/Common/Emitter";
import { normalize } from "@/Common/JSON";
import { unescapeXML } from "@/Common/XML";
import type { InScopeIndexedPartialItems } from "./Types";
export const JSONFeedRenderer: Renderer<InScopeIndexedPartialItems> = (
  datum: InScopeIndexedPartialItems,
) => {
  const { feedUrl } = datum.get("global")?.get(0) ?? {};
  const { pageUrl, pageTitle } = datum.get("page")?.get(0) ?? {};

  let jsonfeed = `{
  "version": "https://jsonfeed.org/version/1.1",
  "language": "ja",
  "title": "${normalize(pageTitle ?? "")}",
  "home_page_url": "${normalize(pageUrl ?? "")}",
  "feed_url": "${normalize(feedUrl ?? "")}",
  "items": [
`;

  const last = datum.get("product")?.size ?? 0;
  let idx = 1;
  for (const product of datum.get("product")?.values() ?? []) {
    if (!product) {
      continue;
    }

    const {
      productTitle,
      productAuthor,
      productUrl,
      productThumbnail,
      productKind,
      productPrice,
      productSalesStatus,
    } = product;

    const html = `
<p><a href="${productUrl}"><img src="${productThumbnail}" alt="${productTitle}" height="450" /></a></p>
<ul>
  <li>タイトル：<a href="${productUrl ?? ""}">${productTitle ?? ""}</a></li>
  <li>作者：${productAuthor ?? ""}</li>
  <li>種別：${productKind ?? ""}</li>
  <li>価格：${productPrice ?? ""}</li>
  <li>販売：${productSalesStatus ?? ""}</li>
</ul>
    `;

    jsonfeed += `{
  "id": "${normalize(unescapeXML(productUrl ?? ""))}",
  "url": "${normalize(unescapeXML(productUrl ?? ""))}",
  "title": "${normalize(unescapeXML(productTitle ?? ""))}",
  "image": "${normalize(unescapeXML(productThumbnail ?? ""))}",
  "content_html": "${normalize(html)}"
}`;

    idx++;
    if (idx <= last) {
      jsonfeed += ",";
    }
  }

  jsonfeed += `]
}`;

  return jsonfeed;
};

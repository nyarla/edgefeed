import type { Renderer } from "@/Common/Emitter";
import { escapeXML } from "@/Common/XML";
import type { InScopeIndexedPartialItems } from "./Types";

export const AtomFeedRenderer: Renderer<InScopeIndexedPartialItems> = (
  datum: InScopeIndexedPartialItems,
) => {
  const { feedUrl } = datum.get("global")?.get(0) ?? {};
  const { pageUrl, pageTitle } = datum.get("page")?.get(0) ?? {};

  const now = new Date(Date.now()).toISOString();

  let atom = `<?xml encoding="utf-8"?>
<atom xmlns="http://www.w3.org/2005/Atom">
  <title type="text">${escapeXML(pageTitle ?? "")}</title>
  <updated>${escapeXML(now)}</updated>
  <id>${escapeXML(feedUrl ?? "")}</id>
  <link rel="alternate" type="text/html" href="${escapeXML(pageUrl ?? "")}" />
  <link rel="self" type="application/atom+xml" href="${escapeXML(feedUrl ?? "")}"/>
  <generator url="https://github.com/nyarla/edgefeed/">
    edgefeed - A web scraping toolkit for generating Atom or JSON Feeds on Cloudflare Workers 
  </generator>
`;

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

    atom += `
  <entry>
    <id>${productUrl}</id>
    <title type="html"><![CDATA[${productTitle}]]></title>
    <updated>${escapeXML(now)}</updated>
    <link rel="alternate" type="text/html" href="${escapeXML(productUrl ?? "")}" />
    <content type="html"><![CDATA[
      <p><a href="${productUrl}"><img src="${productThumbnail}" alt="${productTitle}" height="450" /></a></p>
      <ul>
        <li>タイトル：<a href="${productUrl ?? ""}">${productTitle ?? ""}</a></li>
        <li>作者：${productAuthor ?? ""}</li>
        <li>種別：${productKind ?? ""}</li>
        <li>価格：${productPrice ?? ""}</li>
        <li>販売：${productSalesStatus ?? ""}</li>
      </ul>
    ]]></content>
  </entry>
`;
  }

  atom += "</atom>\n";

  return atom;
};

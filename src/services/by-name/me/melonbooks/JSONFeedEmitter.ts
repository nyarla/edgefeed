import type { IEmitter } from "@/interfaces/IEmitter";
import { escapeJSON as t } from "@/lib/json";
import type { Namespace, Properties, Property, Value } from "./types";

const un = (src: string) =>
  src
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&apos", "'")
    .replaceAll("&qout;", '"')
    .replaceAll("&amp;", "&");

export class JSONFeedEmitter implements IEmitter<Namespace, Property, Value> {
  private props: Properties = {} as Properties;
  private stack: Record<Namespace, Properties> = {} as Record<
    Namespace,
    Properties
  >;
  private list: Record<Namespace, Array<Properties>> = {} as Record<
    Namespace,
    Array<Properties>
  >;

  constructor(feedUrl: Value) {
    this.set("feedUrl", feedUrl);
  }

  set(key: Property, value: Value) {
    this.props[key] = value;
  }

  get(key: Property) {
    return this.props[key];
  }

  add(ns: Namespace, key: Property, value: Value) {
    this.stack[ns] ??= {} as Properties;
    this.stack[ns][key] = value;
  }

  emit(ns: Namespace) {
    this.list[ns] ??= [];

    this.list[ns].push(this.stack[ns]);
    this.stack[ns] = {} as Properties;
  }

  toString() {
    const title = t(`${this.get("circleName")} - メロンブックス`);
    const permalink = t(this.get("circlePage") as string);
    const feedUrl = t(this.get("feedUrl") as string);

    const items = (this.list?.product ?? [])
      .toSorted((a, b) => (a.productId < b.productId ? 1 : -1))
      .map((product) => {
        const id = product.productId.toString(10);
        const title = product.productTitle as string;
        const href = product.productUrl as string;
        const thumbnail = product.productThumbnail as string;
        const kind = product.productKind as string;
        const pricing = product.productPricing as string;
        const state = product.productState as string;

        let content = `<p><a href="${href}"><img src="${thumbnail}" alt="${title}" height="450" /></p>`;

        content += "<ul>";
        content += `<li>タイトル：<a href="${href}">${title}<a></li>`;
        content += `<li>種別：${kind}</li>`;
        content += `<li>価格：${pricing}</li>`;
        content += `<li>販売：${state}</li>`;
        content += "</ul>";

        return `{
  "id": "${t(id)}",
  "url": "${t(un(href))}",
  "title": "${t(un(title))}",
  "image": "${t(un(thumbnail))}",
  "content_html": "${t(content)}"
}`;
      })
      .join(",\n");

    return `{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "${title}",
  "language": "ja",
  "home_page_url": "${permalink}",
  "feed_url": "${feedUrl}",
  "items": [${items}]
}`;
  }
}

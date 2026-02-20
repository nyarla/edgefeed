import type { IEmitter } from "@/interfaces/IEmitter";
import { escapeJSON as t } from "@/lib/json";
import type { Namespace, Properties, Property, Value } from "./types";

/**
 * The internal function of unescape html
 *
 * @param src - the escaped string of html
 * @returns - the raw text from html
 */
const un = (src: string) =>
  src
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&apos", "'")
    .replaceAll("&qout;", '"')
    .replaceAll("&amp;", "&");

/**
 * The JSON Feed emitter.
 *
 * This class makes the jsonfeed string from internal state.
 */
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

  /**
   * The constructor of this class.
   *
   * @param feedUrl - the URL string of jsonfeed.
   */
  constructor(feedUrl: Value) {
    this.set("feedUrl", feedUrl);
  }

  /**
   * Set `value` as `key` property.
   *
   * The `value` means top-level property on jsonfeed without Array properties.
   *
   * @param key - the property key
   * @param value - the property value
   */
  set(key: Property, value: Value) {
    this.props[key] = value;
  }

  /**
   * Get the property `value` by `key`, but without Array properties.
   *
   *
   * @param key - the property key
   * @returns - the property value
   */
  get(key: Property) {
    return this.props[key];
  }

  /**
   * Add the key-value pair to internal stack for Array properties.
   *
   * This method only set to the stack of list,
   * it needs to call `emit` method if flush and append stack value to Array property.
   *
   * @param ns - the namespace of Array properties
   * @param key - the property key
   * @param value - the property value
   */
  add(ns: Namespace, key: Property, value: Value) {
    this.stack[ns] ??= {} as Properties;
    this.stack[ns][key] = value;
  }

  /**
   * Emit the key-value pairs to Array property.
   *
   * This method flush to internal stack state, and adds to internal stack to Array property.
   *
   * @param ns - the property namespace for flush and append to list-defined property.
   */
  emit(ns: Namespace) {
    this.list[ns] ??= [];

    this.list[ns].push(this.stack[ns]);
    this.stack[ns] = {} as Properties;
  }

  /**
   * Makes to JSONFeed string from internal state.
   *
   * @returns - the string of jsonfeed
   */
  toString(): string {
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

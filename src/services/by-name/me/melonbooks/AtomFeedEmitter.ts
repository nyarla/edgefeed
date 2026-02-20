import type { IEmitter } from "@/interfaces/IEmitter";
import type { Namespace, Properties, Property, Value } from "./types";

export class AtomFeedEmitter implements IEmitter<Namespace, Property, Value> {
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
   * Makes to Atom feed string from internal state.
   *
   * @returns - the string of atomfeed
   * */
  toString(): string {
    const title = `${this.get("circleName")} - メロンブックス`;
    const permalink = this.get("circlePage") as string;
    const feedUrl = this.get("feedUrl") as string;
    const name = this.get("circleName");

    const now = new Date(Date.now()).toISOString();

    const entries = (this.list?.product ?? [])
      .toSorted((a, b) => (a.productId < b.productId ? 1 : -1))
      .map((product) => {
        const title = product.productTitle as string;
        const href = product.productUrl as string;
        const thumbnail = product.productThumbnail as string;
        const kind = product.productKind as string;
        const pricing = product.productPricing as string;
        const state = product.productState as string;

        let content = "<entry>";

        content += `<id>${href}</id>`;
        content += `<title type="html"><![CDATA[${title}]]></title>`;
        content += `<updated>${now}</updated>`;

        content += `<link rel="alternate" href="${href}" />`;

        content += `<content type="html"><![CDATA[`;

        content += `<p><a href="${href}"><img src="${thumbnail}" alt="${title}" height="450" /></p>`;

        content += "<ul>";
        content += `<li>タイトル：<a href="${href}">${title}<a></li>`;
        content += `<li>種別：${kind}</li>`;
        content += `<li>価格：${pricing}</li>`;
        content += `<li>販売：${state}</li>`;
        content += "</ul>";
        content += "]]></content>";

        content += "</entry>";

        return content;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="utf-8"?>
<atom xmlns="http://www.w3.org/2005/Atom">
  <id>${feedUrl}</id>
  <title>${title}</title>
  <updated>${now}</updated>
  <link>${permalink}</link>
  <author>
    <name>${name}</name>
  </author>
  <generator url="https://github.com/nyarla/edgefeed">edgefeed - the website to feed transformer.</generator>

  ${entries}
</atom>`;
  }
}

import type { IEmitter } from "@/interfaces/IEmitter";
import { escapeJSON as t } from "@/lib/json";
import type { Namespace, Properties, Property, Value } from "./Types";

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

export class JSONFeedEmitter implements IEmitter<Namespace, Property, Value> {
  private props: Properties;
  private stack: Record<Namespace, Properties>;
  private list: Record<Namespace, Array<Properties>>;

  constructor(feedUrl: string) {
    this.props ??= {} as Properties;
    this.stack ??= {} as Record<Namespace, Properties>;
    this.list ??= {} as Record<Namespace, Array<Properties>>;

    this.set("feedUrl", feedUrl);
  }

  set(key: Property, value: Value) {
    this.props[key] = value;
  }

  get(key: Property) {
    return this.props[key];
  }

  add(ns: Namespace, key: Property, value: Value) {
    this.stack[ns][key] = value;
  }

  emit(ns: Namespace) {
    this.list[ns] ??= [];
    this.list[ns].push(this.stack[ns]);
    this.stack[ns] = {} as Properties;
  }

  toString() {
    const feedTitle = t(un(this.get("feedTitle").replace(/\s+/g, " ")));
    const feedUrl = t(this.get("feedUrl"));

    return `{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "${feedTitle}",
  "language": "en",
  "home_page_url": "https://www.image-line.com/news",
  "feed_url": "${feedUrl}".
  "items": []
}`;
  }
}

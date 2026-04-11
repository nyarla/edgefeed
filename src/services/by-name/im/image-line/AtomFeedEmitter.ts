import type { IEmitter } from "@/interfaces/IEmitter";
import type { Namespace, Properties, Property, Value } from "./Types";

export class AtomFeedEmitter implements IEmitter<Namespace, Property, Value> {
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
    this.stack[ns] ??= {} as Properties;
    this.stack[ns][key] = value;
  }

  emit(ns: Namespace) {
    this.list[ns] ??= [];
    this.list[ns].push(this.stack[ns]);
    this.stack[ns] = {} as Properties;
  }

  toString() {
    const title = this.get("feedTitle");
    const link = "https://www.image-line.com/news";
    const href = this.get("feedUrl");
    const now = new Date(Date.now()).toISOString();

    const entries = (this.list?.entry ?? [])
      .toSorted((a, b) =>
        new Date(a.entryDate) < new Date(b.entryDate) ? 1 : -1,
      )
      .map((entry) => {
        const {
          entryTitle,
          entryUrl,
          entryFirstLine,
          entryImage,
          entryDate = new Date(entry.entryDate).toISOString(),
        } = entry;

        return `<entry>
  <id>${entryUrl}</id>
  <title type="html"><![CDATA[${entryTitle}]]></title>
  <updated>${new Date(entryDate).toISOString()}</updated>
  <link rel="alternate" href="${entryUrl}"/>
  <content type="html"><![CDATA[
    <p><img src="${entryImage}" alt="" /></p>
    <p>${entryFirstLine}</p>
    <p>...</p>
  ]]></content>
</entry>`;
      })
      .join("\n");

    return `<?xml version="1.0" encoding="utf-8"?>
<atom xmlns="http://www.w3.org/2005/Atom">
  <id>${href}</id>
  <title>${title}</title>
  <updated>${now}</updated>
  <link rel="alternate" href="${link}" />
  <link rel="self" href="${href}" />
  <author>
    <name>Image-Line</name>
    <uri>https://www.iamge-line.com</uri>
  </author>
  <generator url="https://github.com/nyarla/edgefeed">edgefeed - the website to feed transformer.</generator>

${entries}
</atom>
`;
  }
}

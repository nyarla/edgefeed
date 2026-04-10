import type { IEmitter } from "@/interfaces/IEmitter";
import type { Namespace, Property, Value } from "./Types";

export class HTMLRewriterTransformer {
  private emitter: IEmitter<Namespace, Property, Value>;
  private rewriter: HTMLRewriter;

  private triggers: Array<string> = [
    "title",
    "h2.update-title",
    "h2.update-title a.update-title-link",
    "div.update-meta a.update-date",
    "div.main-image img",
    "div.text-group",
    "div.text-group > *:first-child",
  ];

  private namespace: Namespace = "" as Namespace;
  private target: Property = "" as Property;
  private entryId = 0;

  private urlPrefix = "https://www.image-line.com";

  constructor(emitter: IEmitter<Namespace, Property, Value>) {
    this.emitter = emitter;
    this.rewriter = new HTMLRewriter();

    for (const selector of this.triggers) {
      this.rewriter.on(selector, this);
    }
  }

  element(el: Element) {
    const classNames = el.getAttribute("class");

    switch (el.tagName) {
      case "title": {
        this.target = "feedTitle";

        break;
      }

      case "h2": {
        if (classNames?.includes("update-title")) {
          if (this.entryId === 0) {
            this.namespace = "entry";
          } else {
            this.emitter.emit(this.namespace);
          }

          this.entryId++;
        }

        break;
      }

      case "a": {
        if (classNames?.includes("update-title-link")) {
          this.target = "entryTitle";

          const href = el.getAttribute("href");
          if (href) {
            const link = href.startsWith("/") ? this.urlPrefix + href : href;
            this.emitter.add(this.namespace, "entryUrl", link);
          }

          break;
        }

        if (classNames?.includes("update-date")) {
          this.target = "entryDate";
          break;
        }

        break;
      }

      case "img": {
        const src = el.getAttribute("src");
        if (src) {
          const link = src.startsWith("/") ? this.urlPrefix + src : src;
          this.emitter.add(this.namespace, "entryImage", link);
        }

        break;
      }

      case "div": {
        if (classNames?.includes("text-group")) {
          this.target = "entryFirstLine";
        }
        break;
      }
    }
  }

  text(t: Text) {
    const text = t.text;

    if (text === "") {
      return;
    }

    if (this.target === "entryFirstLineAfter") {
      return;
    }

    if (this.target === "entryFirstLine" && text.match(/[^\s]/)) {
      this.emitter.add(this.namespace, this.target, text);
      this.target = "entryFirstLineAfter";
      return;
    }

    switch (this.target) {
      case "feedTitle": {
        this.emitter.set(this.target, text);
        break;
      }

      default: {
        this.emitter.add(this.namespace, this.target, text);
        break;
      }
    }
  }

  async parse(src: Response): Promise<string> {
    await this.rewriter.transform(src).text();
    this.emitter.emit(this.namespace);
    return this.emitter.toString();
  }
}

import type { IEmitter } from "@/interfaces/IEmitter";
import type { Namespace, Property, Value } from "./Types";

export class HTMLRewriterTransformer {
  private emitter: IEmitter<Namespace, Property, Value>;
  private rewriter: HTMLRewriter;

  private triggers: Array<string> = ["title"];

  private namespace: Namespace;
  private target: Property;
  private entryId = 0;

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
    }
  }

  text(t: Text) {
    const text = t.text;

    if (text === "") {
      return;
    }

    switch (this.target) {
      case "feedTitle": {
        this.emitter.set(this.target, text);

        break;
      }
    }
  }

  async parse(src: Response): Promise<string> {
    await this.rewriter.transform(src).text();
    return this.emitter.toString();
  }
}

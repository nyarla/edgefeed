import type { IEmitter } from "@/interfaces/IEmitter";
import type { Namespace, Property, Value } from "./types";

/**
 * The html transformer class by HTMLRewriter.
 *
 * This class emit feed string by `IEmitter` implemented classes.
 */
export class HTMLRewriterTransformer {
  private emitter: IEmitter<Namespace, Property, Value>;
  private rewriter: HTMLRewriter;

  private triggers: Array<string> = [
    'link[rel="canonical"]',
    "h1.page-header",

    'li[class^="product_"]',
    'li[class^="product_"] > div.item-image a[href^="/detail"] img.lazyload',

    'li[class^="product_"] > div.item-meta > a[href^="/detail/detail.php"]',
    'li[class^="product_"] > div.item-meta > p > a[href*="list.php"]',
    'li[class^="product_"] > div.item-meta > p.item-price',
    'li[class^="product_"] > div.item-meta a.to_cart',
    'li[class^="product_"] > div.item-meta a.to_request',
    'li[class^="product_"] > div.item-meta a.option_child_cart_button',
  ];
  private namespace: Namespace = "" as Namespace;
  private target: Property = "" as Property;
  private productId = 0;

  private urlPrefix = "https://www.melonbooks.co.jp";

  /**
   * The constructor of `HTMLRewriterTransformer`
   *
   * @param emitter - the instance of feed emitter
   * @returns - the instance of this class
   */
  constructor(emitter: IEmitter<Namespace, Property, Value>) {
    this.emitter = emitter;
    this.rewriter = new HTMLRewriter();

    for (const selector of this.triggers) {
      this.rewriter.on(selector, this);
    }
  }

  /**
   * The `Element` handler for `HTMLRewriter`
   *
   * @param el - the instance of `Element` for `HTMLRewriter`
   */
  element(el: Element) {
    const classNames = el.getAttribute("class") ?? "";

    switch (el.tagName) {
      case "link": {
        const rel = el.getAttribute("rel");
        const href = el.getAttribute("href");

        if (href !== null && rel === "canonical") {
          this.emitter.set("circlePage", href);
        }

        break;
      }

      case "h1": {
        if (classNames.includes("page-header")) {
          this.target = "circleName";
        }

        break;
      }

      case "li": {
        const matches = classNames.match(/product_(\d+)/);

        if (matches !== null) {
          this.namespace = "product";

          const productId = Number.parseInt(matches[1], 10);

          if (this.productId === 0) {
            this.productId = productId;
            this.emitter.add(this.namespace, "productId", productId);
          } else if (this.productId !== productId) {
            this.emitter.emit("product");
            this.productId = productId;
            this.emitter.add(this.namespace, "productId", productId);
          }
        }

        break;
      }

      case "p": {
        if (this.namespace === "product") {
          if (classNames.includes("product_title")) {
            this.target = "productTitle";
            break;
          }

          if (classNames.includes("item-price")) {
            this.target = "productPricing";
          }
        }

        break;
      }

      case "img": {
        if (this.namespace === "product") {
          const thumbnail = el.getAttribute("data-src");
          const title = el.getAttribute("alt");
          if (thumbnail !== null) {
            this.emitter.add(
              this.namespace,
              "productThumbnail",
              `http:${thumbnail}`,
            );
          }

          if (title !== null) {
            this.emitter.add(this.namespace, "productTitle", title);
          }
        }

        break;
      }

      case "a": {
        if (this.namespace === "product") {
          const href = el.getAttribute("href") ?? "#";

          if (
            classNames.includes("to_cart") ||
            classNames.includes("to_request") ||
            classNames.includes("option_child_cart_button")
          ) {
            let state = "不明";
            if (classNames.includes("reserve")) {
              state = "予約";
            } else if (classNames.includes(" cart")) {
              state = "販売中";
            } else if (classNames.includes("dl_to_wish")) {
              state = "電子書籍";
            } else if (classNames.includes("to_request")) {
              state = "売り切れ";
            } else if (classNames.includes("option_child_cart_button")) {
              state = "販売中";
            }

            this.emitter.add(this.namespace, "productState", state);
          }

          if (href.match(/^\/detail\/detail\.php/)) {
            this.emitter.add(
              this.namespace,
              "productUrl",
              this.urlPrefix + href,
            );

            break;
          }

          if (href.includes("list.php")) {
            const label = el.getAttribute("title") ?? "不明";
            this.emitter.add(this.namespace, "productKind", label);
            break;
          }

          if (href === "#" && classNames.includes("to_request")) {
            this.emitter.add(this.namespace, "productState", "売り切れ");
          }

          break;
        }

        break;
      }
    }
  }

  /**
   * The `Text` handler for `HTMLRewriter`
   *
   * @param t - the instance of `Text` for `HTMLRewriter`
   */
  text(t: Text) {
    const text = t.text;
    if (text === "") {
      return;
    }

    switch (this.target) {
      case "productPricing": {
        this.emitter.add(this.namespace, this.target, text);
        break;
      }

      default: {
        this.emitter.set(this.target, text);
        break;
      }
    }

    this.target = "" as Property;
  }

  /**
   * The function of parse `Response` object to feed string
   *
   * @param src - the `Response` object by the fetched melonbooks page.
   * @returns - the `Promise<string>` object for transformed feed.
   */
  async parse(src: Response): Promise<string> {
    await this.rewriter.transform(src).text();
    return this.emitter.toString();
  }
}

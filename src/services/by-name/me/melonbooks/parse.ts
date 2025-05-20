const melonbooksBaseUrl = "https://www.melonbooks.co.jp";

enum Property {
  Unknown = 0,
  CircleName = 1,
  Author = 2,
  ProductTitle = 3,
  ProductKind = 4,
  ProductAvailable = 5,
  ProductPrice = 6,
}

/**
 * Escape string for JSON.
 *
 * @param {string} src - the raw string.
 * @returns {string} - the escaped string from raw.
 */
export const t = (src: string): string =>
  src
    ? src
        .replace(/\t+/g, " ")
        // biome-ignore lint/suspicious/noControlCharactersInRegex: this code remove unsafe string from `src`
        .replace(/[\u0000-\u001F]/g, "")
        .replace(/(["'\\])/g, (_, p1) => `\\${p1}`)
    : "";

/**
 * The transformer class for Melonbooks circle page.
 */
export class JSONFeedTransformer {
  private baseUrl = "";
  private canonicalUrl = "";

  private circleName = "";

  private currentProperty: Property = Property.Unknown;

  private currentProductId = "";
  private currentProductTitle = "";
  private currentProductUrl = "";
  private currentProductPrice = "";
  private currentProductAvailable = "";
  private currentProductAuthors: string[] = [];
  private currentProductMembers: string[] = [];
  private currentProductTags: string[] = [];
  private currentProductHasSpecialContent = false;
  private currentProductThumbnail = "";

  private productList: string[] = [];

  /**
   * The constructor.
   *
   * @param {string} baseUrl - the base URL of JSON Feed.
   * @returns {JSONFeedTransformer} - the instance of JSONFeedTransformer
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * The dispatcher for `HTMLRewriter` elements.
   *
   * @param {Element} el - the `Element` of `HTMLRewriter`.
   */
  element(el: Element) {
    const classNames = el.getAttribute("class");

    switch (el.tagName) {
      case "link": {
        const href = el.getAttribute("href");
        if (href) {
          this.canonicalUrl = href;
        }
        break;
      }

      case "h1": {
        this.currentProperty = Property.CircleName;
        break;
      }

      case "li": {
        if (classNames?.startsWith("product_")) {
          const id = classNames.match(/^product_(\d+)$/)?.[1];
          if (id) {
            if (this.currentProductId === "") {
              this.currentProductId = id;
            } else if (this.currentProductId !== id) {
              this.emitProduct();
              this.currentProductId = id;
            }
          }
        }

        break;
      }

      case "a": {
        const href = el.getAttribute("href");
        if (href?.startsWith("/detail/detail.php")) {
          const url = melonbooksBaseUrl + href;
          this.currentProductUrl = url;
        } else if (href?.startsWith("/circle/index.php")) {
          const url = melonbooksBaseUrl + href;
          const name = el.getAttribute("title");
          this.currentProductAuthors.push(
            `{ "name": "${t(name ?? "不明")}", "url": "${t(url)}" }`,
          );
          this.currentProductMembers.push(`<a href="${url}">${name}</a>`);
        } else if (href?.startsWith("/tags/index.php")) {
          const url = melonbooksBaseUrl + href;
          const name = el.getAttribute("title");
          this.currentProductTags.push(
            `{ "name": "${t(name ?? "不明")}", "url": "${t(url)}" }`,
          );
        }

        break;
      }
      case "p":
      case "div": {
        if (classNames) {
          if (classNames.match(/product_title/)) {
            this.currentProperty = Property.ProductTitle;
            break;
          }

          if (classNames.match(/item-state-special/)) {
            this.currentProductHasSpecialContent = true;
            this.currentProperty = Property.Unknown;
            break;
          }

          if (classNames.match(/item-state-cation/)) {
            this.currentProperty = Property.ProductAvailable;
            break;
          }

          if (classNames.match(/item-price/)) {
            this.currentProperty = Property.ProductPrice;
            break;
          }
        }
        break;
      }

      case "img": {
        if (classNames?.match(/lazyload_product/)) {
          const src = el.getAttribute("data-src");
          if (src) {
            this.currentProductThumbnail = `https:${src}`;
          }
          this.currentProperty = Property.Unknown;
        }
        break;
      }
    }
  }

  /**
   * The dispatcer for `Text` of `HTMLRewriter`
   *
   * @param {Text} t - the `Text` object.
   */
  text(t: Text) {
    const text = t.text;
    if (text === "") {
      return;
    }

    switch (this.currentProperty) {
      case Property.ProductTitle: {
        this.currentProductTitle = text;
        break;
      }

      case Property.ProductPrice: {
        this.currentProductPrice = text;
        break;
      }

      case Property.ProductAvailable: {
        this.currentProductAvailable = text;
        break;
      }

      case Property.CircleName: {
        this.circleName = text;
        break;
      }
    }

    this.currentProperty = Property.Unknown;
  }

  /**
   * Emit the current product data to product list,
   * And reset state of the product data.
   */
  emitProduct() {
    const authors = `"authors": [\n        ${this.currentProductAuthors.join("\n,        ")}\n      ],`;
    const tags = `"tags": [\n        ${this.currentProductTags.join(",\n        ")}\n      ],`;

    const title = this.currentProductTitle;
    const circleName = this.circleName;
    const price = this.currentProductPrice;

    const members = this.currentProductMembers.join(" ");

    const url = this.currentProductUrl;
    const thumbnailUrl = this.currentProductThumbnail;

    const productThumbnail = `<p><a href="${url}"><img src="${thumbnailUrl}" width="450" height="320" /></a></p>`;
    const productTitle = `<li>タイトル：<a href="${url}">${title}</a></li>`;
    const productCircle = `<li>サークル：<a href="${this.canonicalUrl}">${circleName}</a></li>`;
    const productMembers = `<li>参加者：${members}</li>`;
    const productAvailable = `<li>販売状況：${this.currentProductAvailable ? this.currentProductAvailable : "販売中"}</li>`;
    const productPricing = `<li>価格：${price}</li>`;
    const productSpecialContent = this.currentProductHasSpecialContent
      ? "<li>特典アリ</li>"
      : "";

    const content_html = `${productThumbnail}<ul>${productTitle}${productCircle}${productMembers}${productPricing}${productAvailable}${productSpecialContent}</ul>`;

    const productJSON = `{
      "title": "${t(this.currentProductTitle)}",
      "url": "${t(this.currentProductUrl)}",
      "id": "${t(this.currentProductUrl)}",
      ${authors}
      ${tags}
      "content_html": "${t(content_html)}"
    }`;

    this.productList.push(productJSON);

    this.currentProductId = "";
    this.currentProductTitle = "";
    this.currentProductUrl = "";
    this.currentProductAvailable = "";
    this.currentProductAuthors = [];
    this.currentProductMembers = [];
    this.currentProductTags = [];
    this.currentProductHasSpecialContent = false;
    this.currentProductThumbnail = "";
  }

  /**
   * Finalize the JSON Feed of circle page.
   *
   * @returns {string} - the JSON Feed string.
   */
  finalize(): string {
    this.emitProduct();

    const title = t(`${this.circleName} - メロンブックス`);
    const home_page_url = t(this.canonicalUrl);
    const feed_url = t(
      this.baseUrl + this.canonicalUrl.match(/circle_id=(\d+)/)?.[1],
    );

    const products = `    ${this.productList.join(",\n    ")}`;

    return `{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "${title}",
  "language": "ja",
  "home_page_url": "${home_page_url}",
  "feed_url": "${feed_url}",
  "authors": [
    { "name": "${t(this.circleName)}", "url": "${home_page_url}" }
  ],
  "items": [
    ${products}
  ]
}`;
  }

  /**
   * Transform the `Response` data by melonbooks's circle page to JSON Feed string.
   *
   * @param {Response} input - The `Response` object fetched by melonbooks's circle page.
   * @returns {Promise<string>} - The JSON Feed string.
   */
  async transform(input: Response): Promise<string> {
    const rewriter = new HTMLRewriter();

    const selectors = [
      'link[rel="canonical"]',
      "h1.page-header",

      'li[class^="product_"]',

      'li[class^="product_"] div.item-info p.item-state-special',

      'li[class^="product_"] div.item-thumbnail img.lazyload_product',

      'li[class^="product_"] div.item-meta > a[href^="/detail/detail.php"]',
      'li[class^="product_"] div.item-meta > a[href^="/detail/detail.php"] p.product_title',
      'li[class^="product_"] div.item-meta p.item-state-cation',

      'li[class^="product_"] div.item-meta > p.search-item-author-author a[href^="/circle/index.php"]',
      'li[class^="product_"] div.item-meta > p.search-item-author-author a[href^="/tags/index.php"]',

      'li[class^="product_"] div.item-meta > p.item-price',
    ];
    for (const selector of selectors) {
      rewriter.on(selector, this);
    }

    await rewriter.transform(input).text();
    return this.finalize();
  }
}

/**
 * Transform the `Response` object to JSON Feed.
 *
 * @param {Response} input - the `Response` object of melonbooks circle page.
 * @param {string} baseUrl - the base URL string of JSON Feed.
 * @returns {Promise<string>} - the JSON Feed string.
 */
export const transformToJSONFeed = (
  input: Response,
  baseUrl: string,
): Promise<string> => new JSONFeedTransformer(baseUrl).transform(input);

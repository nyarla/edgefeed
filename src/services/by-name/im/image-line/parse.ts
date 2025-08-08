import { escapeJSON as t } from "@/lib/json";

enum Property {
  Unknown = 0,
  Date = 1,
  Href = 2,
  Summary = 3,
  Featured = 5,
  Tag = 6,
  Page = 100,
  Container = 101,
  Tags = 102,
}

/**
 * The transformer class for convert flstudio-news to JSON feed.
 */
export class JSONFeedTransformer {
  private baseUrl = "";

  private state: Property[] = [];

  private pageTitle = "";
  private pageUrl = "";

  private thumbnail = "";
  private thumbnailWidth = "";
  private thumbnailHeight = "";
  private date = "";
  private title = "";
  private href = "";
  private summary = "";
  private tags: string[] = [];

  private entries: string[] = [];

  /**
   * The constructor.
   *
   * @param {string} baseUrl - the base URL of JSON Feed,
   * @returns {JSONFeedTransformer} - the instance of JSONFeedTransformer
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * The dispatcher for `HTMLRewriter` elements.
   *
   * @param {Element} el - the `Element` object by `HTMLRewriter`
   */
  element(el: Element) {
    const classNames = el.getAttribute("class");

    switch (el.tagName) {
      case "title": {
        this.state.push(Property.Page);

        break;
      }

      case "link": {
        if (el.getAttribute("rel") === "canonical") {
          const href = el.getAttribute("href");
          if (href) {
            this.pageUrl = href;
          }
        }

        break;
      }

      case "div": {
        if (classNames?.startsWith("c-post__content")) {
          if (this.state.at(-1) === Property.Tags) {
            this.state.pop();
          }

          if (this.href === "") {
            this.state.push(Property.Container);
          } else {
            this.emitEntry();
          }
          break;
        }

        if (classNames?.startsWith("c-post__excerpt")) {
          this.state.push(Property.Summary);
          el.onEndTag(() => {
            this.state.pop();
          });
          break;
        }

        if (classNames?.startsWith("c-post__featured")) {
          this.state.push(Property.Featured);
          el.onEndTag(() => {
            this.state.pop();
          });
        }
        break;
      }

      case "span": {
        if (this.state.at(-1) === Property.Container) {
          this.state.push(Property.Date);
          el.onEndTag(() => {
            if (this.state.at(-1) === Property.Date) {
              this.state.pop();
            }
          });
        }
        break;
      }

      case "a": {
        if (this.state.at(-1) === Property.Tags) {
          this.state.push(Property.Tag);
          el.onEndTag(() => {
            this.state.pop();
          });
        }

        if (el.getAttribute("data-article-title")) {
          const title = el.getAttribute("data-article-title");
          const href = el.getAttribute("href");

          if (title && href) {
            this.title = title;
            this.href = href;
          }
          break;
        }

        break;
      }

      case "img": {
        const src = el.getAttribute("data-lazy-src");
        const width = el.getAttribute("width");
        const height = el.getAttribute("height");
        if (src && width && height) {
          this.thumbnail = src;
          this.thumbnailWidth = width;
          this.thumbnailHeight = height;
        }
        break;
      }

      case "h4": {
        this.state.push(Property.Tags);
        break;
      }
    }
  }

  /**
   * The dispatcher for `HTMLRewriter` text.
   *
   * @param {Text} t - the `Text` object by `HTMLRewriter`.
   */
  text(t: Text) {
    const text = t.text.replace(/^\s*|\s*$/g, "");
    if (text === "") {
      return;
    }

    switch (this.state.at(-1)) {
      case Property.Page: {
        this.pageTitle = text;
        break;
      }

      case Property.Summary: {
        if (text.match(/[^\s]/) && !this.summary.endsWith(text)) {
          this.summary += this.summary === "" ? text : ` ${text}`;
        }
        break;
      }

      case Property.Featured: {
        if (text.match(/[^\s]/) && !this.summary.endsWith(text)) {
          this.summary += this.summary === "" ? text : ` ${text}`;
        }

        break;
      }

      case Property.Date: {
        const match = text.match(/(\d{2})-(\d{2})-(\d{4})/);
        if (match) {
          const [_, day, month, year] = match;
          this.date = `${year}-${month}-${day}T00:00:00Z`;
        }

        break;
      }

      case Property.Tag: {
        this.tags.push(text);
        break;
      }
    }
  }

  /**
   * Emit the current data to entries list.
   *
   * The state data is reset by this method.
   */
  emitEntry() {
    const thumbnail =
      this.thumbnail !== ""
        ? t(
            `<p><a href="${this.href}"><img src="${this.thumbnail}" width="${this.thumbnailWidth}" height="${this.thumbnailHeight}" /></a></p>`,
          )
        : "";

    const tags =
      this.tags.length > 0
        ? `"tags": [ ${Array.from(new Set(this.tags))
            .map((x) => `"${t(x)}"`)
            .join(", ")} ],`
        : "";

    const entryJSON = `{
      "title": "${t(this.title)}",
      "id": "${t(this.href)}",
      "url": "${t(this.href)}",
      "content_html": "${thumbnail}${t(this.summary)}",
      ${tags}
      "date_published": "${this.date}"
    }`;

    this.entries.push(entryJSON);

    this.thumbnail = "";
    this.date = "";
    this.href = "";
    this.summary = "";
    this.tags = [];
  }

  /**
   * Finalize entries data and emit JSON Feed string.
   *
   * @returns {string} - the JSON Feed string.
   */
  finalize(): string {
    this.emitEntry();

    const title = t(this.pageTitle);
    const home_page_url = t(this.pageUrl);
    const feed_url = t(this.baseUrl);

    const entries = `${this.entries.join(",\n    ")}`;
    return `{
  "version": "https://jsonfeed.org/version/1.1",
  "title": "${title}",
  "language": "en-US",
  "home_page_url": "${home_page_url}",
  "feed_url": "${feed_url}",
  "items": [
    ${entries}
  ]
}`;
  }

  /**
   * Transform `REsponnse` object of flstudio-news page to JSON Feed string.
   *
   * @param {Response} input - the `Response` object fetched from flstudio-news page.
   * @returns {Promise<string>} - the JSON Feed string by flstudio-news page.
   */
  async transform(input: Response): Promise<string> {
    let rewriter = new HTMLRewriter();

    const selectors = [
      "title",
      `link[rel="canonical"]`,

      ".c-post .c-post__image img[data-lazy-src]",
      ".c-post .c-post__content",
      ".c-post .c-post__content > span:first-child",
      ".c-post .c-post__content > .h3 > a[data-article-title]",

      ".c-post .c-post__content > .c-post__featured",
      ".c-post .c-post__content > .c-post__excerpt",

      ".c-post .c-post__content > div > h4",
      ".c-post .c-post__content > div > a",
    ];

    for (const selector of selectors) {
      rewriter = rewriter.on(selector, this);
    }

    await rewriter.transform(input).text();
    return this.finalize();
  }
}

/**
 * The transformer for flstudio-news page to JSON Feed.
 *
 * @param {Response} input - the `Response` object from flstudio-news page.
 * @param {string} baseUrl - the base URL of JSON Feed.
 * @returns {Promise<string>} - the JSON Feed string from flstudio-news page.
 */
export const transformToJSONFeed = (
  input: Response,
  baseUrl: string,
): Promise<string> => new JSONFeedTransformer(baseUrl).transform(input);

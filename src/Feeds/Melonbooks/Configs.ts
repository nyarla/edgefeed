import type { ExtractHandlerConfig } from "@/Common/Handlers";
import type { Prop, Scope } from "./Types";

const MELONBOOKS_URL = "https://www.melonbooks.co.jp" as const;

const productRoot = 'li[class^="product_"]' as const;
const productInfo = `${productRoot} > .item-meta` as const;

export const configs: [string, ExtractHandlerConfig<Scope, Prop>][] = [
  /* Switch to `page` scope. */
  ['link[rel="canonical"]', { type: "EnterScope", scope: "page" }],

  // Extract the page URL from the canonical URL.
  [
    'link[rel="canonical"]',
    {
      type: "URLAttribute",
      attr: "href",
      prop: "pageUrl",
      baseUrl: MELONBOOKS_URL,
    },
  ],

  // Extract the page title from the page header text.
  ["h1.page-header", { type: "BufferedString", prop: "pageTitle" }],

  /* Switch to `product` scope. */
  [".item-list > ul", { type: "EnterScope", scope: "product" }],

  // Increment the product ID in this scope.
  [productRoot, { type: "IncrementScopeId" }],
  [productRoot, { type: "StringAttribute", attr: "class", prop: "productId" }],

  // Extract the thumbnail URL.
  [
    `${productRoot} > .item-image .item-thumbnail img[data-src]`,
    {
      type: "URLAttribute",
      attr: "data-src",
      prop: "productThumbnail",
      baseUrl: MELONBOOKS_URL,
    },
  ],

  // Extract the permalink URL.
  [
    `${productInfo} > a[href]`,
    {
      type: "URLAttribute",
      attr: "href",
      prop: "productUrl",
      baseUrl: MELONBOOKS_URL,
    },
  ],

  // Extract the product title.
  [
    `${productInfo} > a[href] > p`,
    { type: "BufferedString", prop: "productTitle" },
  ],

  // Extract the product author.
  [
    `${productInfo} > p > a[title][href^="/circle/index.php"]`,
    { type: "StringAttribute", attr: "title", prop: "productAuthor" },
  ],
  [
    `${productInfo} > p > a[title][href^="/search/search.php"]`,
    { type: "StringAttribute", attr: "title", prop: "productAuthor" },
  ],

  // Extract the product kind.
  [
    `${productInfo} > p > a[title][href*="list.php"]`,
    { type: "StringAttribute", attr: "title", prop: "productKind" },
  ],

  // Extract the sales status.
  [
    `${productInfo} a[data-product_id].cart.to_cart`,
    {
      type: "StaticString",
      prop: "productSalesStatus",
      value: "販売中",
    },
  ],

  [
    `${productInfo} a.option_child_cart_button`,
    {
      type: "StaticString",
      prop: "productSalesStatus",
      value: "販売中",
    },
  ],

  [
    `${productInfo} a[data-product_id].reserve`,
    {
      type: "StaticString",
      prop: "productSalesStatus",
      value: "予約",
    },
  ],

  [
    `${productInfo} a[data-product_id].to_request`,
    {
      type: "StaticString",
      prop: "productSalesStatus",
      value: "売り切れ",
    },
  ],

  [
    `${productInfo} a[data-product_id].dl_to_wish`,
    {
      type: "StaticString",
      prop: "productSalesStatus",
      value: "電子書籍",
    },
  ],

  // Extract the product sales price.
  [
    `${productInfo} .item-price`,
    {
      type: "BufferedString",
      prop: "productPrice",
    },
  ],
] as const;

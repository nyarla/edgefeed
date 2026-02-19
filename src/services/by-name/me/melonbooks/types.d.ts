export type Namespace = "product" | "authors";

export type Property =
  | "feedUrl"
  | "circleName"
  | "circlePage"
  | "productId"
  | "productTitle"
  | "productUrl"
  | "productThumbnail"
  | "productKind"
  | "productPricing"
  | "productState";

export type Value = string | number;

export type Properties = Record<Property, Value>;

export type Scope = "global" | "page" | "product";

export type GlobalProp = "feedUrl" | "feedTitle";
export type PageProp = "pageTitle" | "pageUrl";
export type ProductProp =
  | "productId"
  | "productTitle"
  | "productAuthor"
  | "productUrl"
  | "productThumbnail"
  | "productKind"
  | "productPrice"
  | "productSalesStatus";

export type Prop = GlobalProp | PageProp | ProductProp;

export type Value = string;

export type Item = Record<Prop, Value>;
export type PartialItem = Partial<Item>;
export type IndexedPartialItems = Map<number, PartialItem>;
export type InScopeIndexedPartialItems = Map<Scope, IndexedPartialItems>;

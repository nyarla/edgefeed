export type Scope = "global" | "page" | "product";

export type GlobalProp = "feedUrl" | "feedTitle";
export type PageProp = "pageTitle" | "pageUrl";
export type ProductProp =
  | "productTitle"
  | "productAuthor"
  | "productUrl"
  | "productThumbnail"
  | "productKind"
  | "productPrice"
  | "productSalesStatus";

export type Prop = GlobalProp | PageProp | ProductProp;

export type Item = Record<Prop, string>;
export type PartialItem = Partial<Item>;
export type IndexedPartialItems = Map<number, PartialItem>;
export type InScopeIndexedPartialItems = Map<Scope, IndexedPartialItems>;

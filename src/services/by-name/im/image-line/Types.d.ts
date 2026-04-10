export type Namespace = "entry";

export type Property =
  | "feedTitle"
  | "feedUrl"
  | "entryTitle"
  | "entryUrl"
  | "entryDate"
  | "entryImage"
  | "entryFirstLine"
  | "entryFirstLineAfter";

export type Value = string;

export type Properties = Record<Property, Value>;

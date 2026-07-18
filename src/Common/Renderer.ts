import type { Renderer } from "./Emitter";

export type ItemBase<K extends string, V extends string> = Record<K, V>;

export type PartialItemBase<K extends string, V extends string> = Partial<
  ItemBase<K, V>
>;

export type IndexedPartialItemBaseMap<K extends string, V extends string> = Map<
  number,
  PartialItemBase<K, V>
>;

export type InScopeIndexedPartialItemBaseMap<
  S extends string,
  K extends string,
  V extends string,
> = Map<S, IndexedPartialItemBaseMap<K, V>>;

export const DumpRenderer: Renderer<
  InScopeIndexedPartialItemBaseMap<string, string, string>
> = (src: InScopeIndexedPartialItemBaseMap<string, string, string>): string => {
  const dump: Record<string, Record<string, string>[]> = {};
  for (const [scope, indexedMap] of src) {
    dump[scope] ??= [];
    for (const [idx, data] of indexedMap) {
      dump[scope][idx] = {
        ...(dump[scope][idx] ?? {}),
        ...data,
      } as Record<string, string>;
    }
  }

  return JSON.stringify(dump, null, 2);
};

export interface Filter<S extends string, K extends string, V extends string> {
  filter: (scope: S, id: number, item: PartialItemBase<K, V>) => boolean;
}

export const createFilteredRenderer =
  <S extends string, K extends string, V extends string>(
    renderer: Renderer<InScopeIndexedPartialItemBaseMap<S, K, V>>,
    filter: Filter<S, K, V>,
  ) =>
  (src: InScopeIndexedPartialItemBaseMap<S, K, V>) => {
    const filtered: InScopeIndexedPartialItemBaseMap<S, K, V> = new Map(src);
    for (const [scope, indexedMap] of src) {
      for (const [id, data] of indexedMap) {
        if (!filter.filter(scope, id, data)) {
          indexedMap.delete(id);
        }
      }
    }

    return renderer(filtered);
  };

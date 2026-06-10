import type { Renderer } from "./Emitter";

type ItemBase = Record<string, string>;
type PartialItemBase = Partial<ItemBase>;
type IndexedPartialItemBaseMap = Map<number, PartialItemBase>;
type InScopeIndexedPartialItemBaseMap = Map<string, IndexedPartialItemBaseMap>;

export const DumpRenderer: Renderer<InScopeIndexedPartialItemBaseMap> = (
  src: InScopeIndexedPartialItemBaseMap,
): string => {
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

export interface Filter {
  filter: (scope: string, id: number, item: PartialItemBase) => boolean;
}

export const createFilteredRenderer =
  (renderer: Renderer<InScopeIndexedPartialItemBaseMap>, filter: Filter) =>
  (src: InScopeIndexedPartialItemBaseMap) => {
    const filtered: InScopeIndexedPartialItemBaseMap = new Map(src);
    for (const [scope, indexedMap] of src) {
      for (const [id, data] of indexedMap) {
        if (!filter.filter(scope, id, data)) {
          indexedMap.delete(id);
        }
      }
    }

    return renderer(filtered);
  };

import type { Renderer } from "./Emitter";

type DumpData = Map<string, Map<number, Partial<Record<string, string>>>>;

export const DumpRenderer: Renderer<DumpData> = (src: DumpData): string => {
  const dump: Record<string, Record<string, string>[]> = {};
  for (const [scope, payload] of src) {
    dump[scope] = dump[scope] ?? [];
    for (const [idx, datum] of payload) {
      dump[scope][idx] = {
        ...(dump[scope][idx] ?? {}),
        ...datum,
      } as Record<string, string>;
    }
  }

  return JSON.stringify(dump, null, 2);
};

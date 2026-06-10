import { describe, expect, it } from "vitest";
import { Emitter } from "./Emitter";
import { createFilteredRenderer, DumpRenderer } from "./Renderer";

describe("DumpRenderer", () => {
  it("should render the JSON string", () => {
    const emitter = new Emitter({ renderer: DumpRenderer });

    emitter.set("global", 0, { foo: "bar" });
    emitter.set("global", 0, { bar: "baz" });
    emitter.set("global", 0, { baz: "foo" });

    emitter.set("first", 0, { foo: "bar", bar: "baz" });
    emitter.set("first", 0, { baz: "foo" });

    expect(JSON.parse(emitter.toString())).toStrictEqual({
      global: [
        {
          bar: "baz",
          baz: "foo",
          foo: "bar",
        },
      ],

      first: [
        {
          bar: "baz",
          baz: "foo",
          foo: "bar",
        },
      ],
    });
  });
});

describe("FilteredRenderer", () => {
  it("should render the filtered JSON string", () => {
    const filter = {
      filter: (
        scope: string,
        id: number,
        item: Partial<Record<string, string>>,
      ): boolean => scope === "global" && id % 2 === 0 && item?.foo === "bar",
    };

    const renderer = createFilteredRenderer(DumpRenderer, filter);
    const emitter = new Emitter({ renderer });

    emitter.set("global", 0, { foo: "bar", bar: "baz" });
    emitter.set("global", 1, { foo: "bar", bar: "baz" });
    emitter.set("global", 2, { foo: "bar", bar: "baz" });
    emitter.set("global", 3, { foo: "bar", bar: "baz" });
    emitter.set("global", 4, { foo: "bar", bar: "baz" });

    emitter.set("first", 0, { foo: "bar", bar: "baz" });
    emitter.set("second", 1, { foo: "bar", bar: "baz" });
    emitter.set("third", 2, { foo: "bar", bar: "baz" });
    emitter.set("fourth", 3, { foo: "bar", bar: "baz" });
    emitter.set("fifth", 4, { foo: "bar", bar: "baz" });

    expect(JSON.parse(emitter.toString())).toStrictEqual({
      global: [
        { foo: "bar", bar: "baz" },
        null,
        { foo: "bar", bar: "baz" },
        null,
        { foo: "bar", bar: "baz" },
      ],

      first: [],
      second: [],
      third: [],
      fourth: [],
      fifth: [],
    });
  });
});

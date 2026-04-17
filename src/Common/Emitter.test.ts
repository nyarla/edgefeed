import { beforeEach, describe, expect, it } from "vitest";

import { Emitter } from "./Emitter";

type TestItem = Record<string, string>;
type TestItemsMap = Map<string, Map<number, Partial<TestItem>>>;
type TestItemRecord = Record<string, Record<number, Partial<TestItem>>>;
type TestEmitter = Emitter<string, TestItem>;

describe("Emitter", () => {
  let emitter: TestEmitter;

  const renderer = (items: TestItemsMap) => {
    const out: TestItemRecord = {};

    for (const [scope, data] of items) {
      for (const [key, value] of data) {
        out[scope] ??= {};
        out[scope][key] = value;
      }
    }

    return JSON.stringify(out);
  };

  beforeEach(() => {
    emitter = new Emitter({ renderer });
  });

  it("common test for `set` and `toString`.", () => {
    emitter.set("simple", 0, { foo: "bar" });

    expect(JSON.parse(emitter.toString())).toStrictEqual({
      simple: {
        "0": {
          foo: "bar",
        },
      },
    });
  });

  it("merge test for the same scope and id", () => {
    emitter.set("merge", 0, { foo: "bar" });
    emitter.set("merge", 0, { bar: "baz" });

    expect(JSON.parse(emitter.toString())).toStrictEqual({
      merge: {
        "0": {
          foo: "bar",
          bar: "baz",
        },
      },
    });
  });

  it("set complex values by set", () => {
    emitter.set("first", 0, { foo: "bar" });
    emitter.set("first", 0, { bar: "baz" });

    emitter.set("first", 1, { baz: "foo" });
    emitter.set("first", 1, { foo: "bar" });

    emitter.set("second", 0, { foo: "bar" });
    emitter.set("second", 0, { bar: "baz" });
    emitter.set("second", 0, { baz: "foo" });
    emitter.set("second", 0, { foo: "FOO" });

    expect(JSON.parse(emitter.toString())).toStrictEqual({
      first: {
        "0": {
          foo: "bar",
          bar: "baz",
        },
        "1": {
          baz: "foo",
          foo: "bar",
        },
      },
      second: {
        "0": {
          foo: "FOO",
          bar: "baz",
          baz: "foo",
        },
      },
    });
  });
});

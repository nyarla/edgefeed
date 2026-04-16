import { beforeEach, describe, expect, it } from "vitest";

import { ParserContext } from "./ParserContext";

type Scope = "init" | "foo" | "bar" | "baz";

describe("ParserContext", () => {
  let pc!: ParserContext<Scope>;

  beforeEach(() => {
    pc = new ParserContext<Scope>("init");
  });

  describe("context scope tests", () => {
    it("enters and leaves to scope", () => {
      expect(pc.context().scope).toBe("init");

      pc.enterScope("foo");
      expect(pc.context().scope).toBe("foo");

      pc.enterScope("bar");
      expect(pc.context().scope).toBe("bar");

      pc.endScope();
      expect(pc.context().scope).toBe("foo");
    });

    it("maintains initial state when calling endScope on base scope", () => {
      pc.endScope();
      expect(pc.context().scope).toBe("init");

      pc.endScope();
      expect(pc.context().scope).toBe("init");
    });
  });

  describe("context ID tests", () => {
    it("increments and decrements to ID", () => {
      pc.incrementId();
      pc.incrementId();
      expect(pc.context().id).toBe(2);

      pc.decrementId();
      expect(pc.context().id).toBe(1);
    });

    it("decrementId should not became a negative number", () => {
      pc.decrementId();
      pc.decrementId();
      pc.decrementId();

      expect(pc.context().id).toBe(0);
    });
  });

  describe("combined tests", () => {
    it("correctly manages nested scope state", () => {
      pc.incrementId();

      pc.enterScope("foo");
      pc.incrementId();
      pc.incrementId();

      pc.enterScope("bar");
      pc.incrementId();

      pc.enterScope("baz");
      expect(pc.context()).toStrictEqual({ scope: "baz", id: 0 });

      pc.endScope();
      expect(pc.context()).toStrictEqual({ scope: "bar", id: 1 });

      pc.endScope();
      expect(pc.context()).toStrictEqual({ scope: "foo", id: 2 });

      pc.endScope();
      expect(pc.context()).toStrictEqual({ scope: "init", id: 1 });
    });

    it("resets to the initial state", () => {
      pc.enterScope("foo");
      pc.enterScope("bar");
      pc.enterScope("baz");
      pc.incrementId();
      pc.incrementId();

      expect(pc.context()).toStrictEqual({ scope: "baz", id: 2 });

      pc.reset();

      expect(pc.context()).toStrictEqual({ scope: "init", id: 0 });
    });
  });
});

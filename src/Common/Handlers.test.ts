import { beforeEach, describe, expect, it } from "vitest";
import { Emitter } from "./Emitter";
import { ParserContext } from "./ParserContext";
import { Transformer } from "./Transformer";
import { DumpRenderer } from "./Utils";

type Scope = "root" | "parent" | "child";

type Prop = string;

type Item = {
  key: string;
  value: string;
};

const HTML = `
<!doctype>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="canonical" href="https://example.com/foo.html" />
    <link rel="alternate" href="" />
    <link rel="self" />
  </head>
  <body>
    <p class="msg">
      hello, world!
      this is a simple message.
    </p>
    <p class="nest">
      this is an <em>important</em> message.
    </p>
  </body>
</html>
`;

describe("Handlers", () => {
  let emitter!: Emitter<Scope, Item>;
  let pc!: ParserContext<Scope>;
  let src!: Response;

  const baseUrl = "https://example.com";

  beforeEach(() => {
    emitter = new Emitter<Scope, Item>({ renderer: DumpRenderer });
    pc = new ParserContext<Scope>("root");
    src = new Response(HTML, {
      status: 200,
      headers: {
        "Content-Type": 'text/html; charset="utf-8"',
      },
    });
  });

  describe("URLAttributeHandler", () => {
    it("should return a URL extracted from a HTML", async () => {
      const transformer = new Transformer<Scope, Prop>(emitter, pc, [
        [
          'link[rel="canonical"]',
          { type: "URLAttribute", prop: "href", attr: "href", baseUrl },
        ],
      ]);

      await transformer.transform(src);

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ href: "https://example.com/foo.html" }],
      });
    });

    it("should return an empty result if the attribute is empty", async () => {
      const transformer = new Transformer<Scope, Prop>(emitter, pc, [
        [
          'link[rel="alternate"]',
          { type: "URLAttribute", prop: "href", attr: "href", baseUrl },
        ],
      ]);

      await transformer.transform(src);

      expect(JSON.parse(emitter.toString())).toStrictEqual({});
    });

    it("should return an empty result if the element doesn't have an attribute", async () => {
      const transformer = new Transformer<Scope, Prop>(emitter, pc, [
        [
          'link[rel="self"]',
          { type: "URLAttribute", prop: "href", attr: "href", baseUrl },
        ],
      ]);

      await transformer.transform(src);

      expect(JSON.parse(emitter.toString())).toStrictEqual({});
    });
  });

  describe("StringAttributeHandler", () => {
    it("should return an attribute value extracted from a HTML", async () => {
      const transformer = new Transformer<Scope, Prop>(emitter, pc, [
        [
          "meta[charset]",
          { type: "StringAttribute", prop: "encoding", attr: "charset" },
        ],
      ]);

      await transformer.transform(src);

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ encoding: "utf-8" }],
      });
    });

    it("should return an empty result if the element has an empty attribute", async () => {
      const transformer = new Transformer<Scope, Prop>(emitter, pc, [
        [
          'link[rel="alternate"]',
          { type: "StringAttribute", prop: "href", attr: "href" },
        ],
      ]);

      await transformer.transform(src);

      expect(JSON.parse(emitter.toString())).toStrictEqual({});
    });

    it("should return an empty result if the element doesn't have an attribute", async () => {
      const transformer = new Transformer<Scope, Prop>(emitter, pc, [
        [
          'link[rel="self"]',
          { type: "StringAttribute", prop: "href", attr: "href" },
        ],
      ]);

      await transformer.transform(src);

      expect(JSON.parse(emitter.toString())).toStrictEqual({});
    });
  });

  describe("BufferedStringHandler", () => {
    it("should return a single-line text extracted from HTML content", async () => {
      const transformer = new Transformer<Scope, Prop>(emitter, pc, [
        ["p.msg", { type: "BufferedString", prop: "message" }],
      ]);

      await transformer.transform(src);

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ message: "hello, world! this is a simple message." }],
      });
    });

    it("should return plain text extracted from the HTML content tree", async () => {
      const transformer = new Transformer<Scope, Prop>(emitter, pc, [
        ["p.nest", { type: "BufferedString", prop: "message" }],
      ]);

      await transformer.transform(src);

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ message: "this is an important message." }],
      });
    });
  });

  describe("StaticStringHandler", () => {
    it("should set a static value if the element is found", async () => {
      const transformer = new Transformer<Scope, Prop>(emitter, pc, [
        ["p.msg", { type: "StaticString", prop: "constant", value: "const" }],
      ]);

      await transformer.transform(src);

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ constant: "const" }],
      });
    });

    it("should set the latest static value if multiple elements are found", async () => {
      const transformer = new Transformer<Scope, Prop>(emitter, pc, [
        ["link", { type: "StaticString", prop: "constant", value: "const" }],
      ]);

      await transformer.transform(src);

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ constant: "const" }],
      });
    });
  });

  describe("EnterScopeHandler", () => {
    it("should enter the specified context scope if the element is found", async () => {
      const transformer = new Transformer<Scope, string>(emitter, pc, [
        ["p.msg", { type: "EnterScope", scope: "parent" }],
        ["p.msg", { type: "StaticString", prop: "value", value: "new scope" }],
        ["p.nest", { type: "EnterScope", scope: "child" }],
        ["p.nest", { type: "StaticString", prop: "value", value: "new scope" }],
      ]);

      await transformer.transform(src);

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        parent: [{ value: "new scope" }],
        child: [{ value: "new scope" }],
      });
    });
  });

  describe("EndScopeHandler", () => {
    it("should exit the current context scope if the element is found", async () => {
      const transformer = new Transformer<Scope, string>(emitter, pc, [
        ["p.msg", { type: "EnterScope", scope: "parent" }],
        ["p.msg", { type: "StaticString", prop: "value", value: "new scope" }],
        ["p.nest", { type: "EndScope" }],
        ["p.nest", { type: "StaticString", prop: "value", value: "new scope" }],
      ]);

      await transformer.transform(src);

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ value: "new scope" }],
        parent: [{ value: "new scope" }],
      });
    });
  });

  describe("IncrementScopeIdHandler", () => {
    it("should increment scope's ID if the element is found", async () => {
      const transformer = new Transformer<Scope, string>(emitter, pc, [
        ["link", { type: "IncrementScopeId" }],
        ["link", { type: "StaticString", prop: "value", value: "new scope" }],
      ]);

      await transformer.transform(src);

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [
          null,
          { value: "new scope" },
          { value: "new scope" },
          { value: "new scope" },
        ],
      });
    });
  });
});

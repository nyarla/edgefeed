import { beforeEach, describe, expect, it } from "vitest";
import { Emitter } from "./Emitter";
import {
  BufferedStringHandler,
  EndScopeHandler,
  EnterScopeHandler,
  IncrementScopeIdHandler,
  StaticStringHandler,
  StringAttributeHandler,
  URLAttributeHandler,
} from "./Handlers";
import { ParserContext } from "./ParserContext";
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
  let rewriter!: HTMLRewriter;
  let src!: Response;

  const baseUrl = "https://example.com";

  beforeEach(() => {
    emitter = new Emitter<Scope, Item>({ renderer: DumpRenderer });
    pc = new ParserContext<Scope>("root");
    rewriter = new HTMLRewriter();
    src = new Response(HTML, {
      status: 200,
      headers: {
        "Content-Type": 'text/html; charset="utf-8"',
      },
    });
  });

  describe("URLAttributeHandler", () => {
    it("should return a URL extracted from a HTML", async () => {
      const handler = new URLAttributeHandler<Scope, Prop>({
        type: "URLAttribute",
        emitter,
        pc,
        baseUrl,
        prop: "href",
        attr: "href",
      });

      rewriter.on('link[rel="canonical"]', handler);

      await rewriter.transform(src).arrayBuffer();

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ href: "https://example.com/foo.html" }],
      });
    });

    it("should return an empty result if the attribute is empty", async () => {
      const handler = new URLAttributeHandler<Scope, Prop>({
        type: "URLAttribute",
        emitter,
        pc,
        baseUrl,
        prop: "href",
        attr: "href",
      });

      rewriter.on('link[rel="alternate"]', handler);

      await rewriter.transform(src).arrayBuffer();

      expect(JSON.parse(emitter.toString())).toStrictEqual({});
    });

    it("should return an empty result if the element doesn't have an attribute", async () => {
      const handler = new URLAttributeHandler<Scope, Prop>({
        type: "URLAttribute",
        emitter,
        pc,
        baseUrl,
        prop: "href",
        attr: "href",
      });

      rewriter.on('link[rel="self"]', handler);

      await rewriter.transform(src).arrayBuffer();

      expect(JSON.parse(emitter.toString())).toStrictEqual({});
    });
  });

  describe("StringAttributeHandler", () => {
    it("should return an attribute value extracted from a HTML", async () => {
      const handler = new StringAttributeHandler<Scope, Prop>({
        type: "StringAttribute",
        emitter,
        pc,
        prop: "encoding",
        attr: "charset",
      });

      rewriter.on("meta[charset]", handler);

      await rewriter.transform(src).arrayBuffer();

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ encoding: "utf-8" }],
      });
    });

    it("should return an empty result if the element has an empty attribute", async () => {
      const handler = new StringAttributeHandler<Scope, Prop>({
        type: "StringAttribute",
        emitter,
        pc,
        prop: "href",
        attr: "href",
      });

      rewriter.on('link[rel="alternate"]', handler);

      await rewriter.transform(src).arrayBuffer();

      expect(JSON.parse(emitter.toString())).toStrictEqual({});
    });

    it("should return an empty result if the element doesn't have an attribute", async () => {
      const handler = new StringAttributeHandler<Scope, Prop>({
        type: "StringAttribute",
        emitter,
        pc,
        prop: "href",
        attr: "href",
      });

      rewriter.on('link[rel="self"]', handler);

      await rewriter.transform(src).arrayBuffer();

      expect(JSON.parse(emitter.toString())).toStrictEqual({});
    });
  });

  describe("BufferedStringHandler", () => {
    it("should return a single-line text extracted from HTML content", async () => {
      const handler = new BufferedStringHandler<Scope, Prop>({
        type: "BufferedString",
        emitter,
        pc,
        prop: "message",
      });

      rewriter.on("p.msg", handler);

      await rewriter.transform(src).arrayBuffer();

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ message: "hello, world! this is a simple message." }],
      });
    });

    it("should return plain text extracted from the HTML content tree", async () => {
      const handler = new BufferedStringHandler<Scope, Prop>({
        type: "BufferedString",
        emitter,
        pc,
        prop: "message",
      });

      rewriter.on("p.nest", handler);

      await rewriter.transform(src).arrayBuffer();

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ message: "this is an important message." }],
      });
    });
  });

  describe("StaticStringHandler", () => {
    it("should set a static value if the element is found", async () => {
      const handler = new StaticStringHandler<Scope, Prop>({
        type: "StaticString",
        emitter,
        pc,
        prop: "constant",
        value: "const",
      });

      rewriter.on("p.msg", handler);

      await rewriter.transform(src).arrayBuffer();

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ constant: "const" }],
      });
    });

    it("should set the latest static value if multiple elements are found", async () => {
      const handler = new StaticStringHandler<Scope, Prop>({
        type: "StaticString",
        emitter,
        pc,
        prop: "constant",
        value: "const",
      });

      rewriter.on("link", handler);

      await rewriter.transform(src).arrayBuffer();

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ constant: "const" }],
      });
    });
  });

  describe("EnterScopeHandler", () => {
    it("should enter the specified context scope if the element is found", async () => {
      const parentScope = new EnterScopeHandler<Scope>({
        type: "EnterScope",
        pc,
        scope: "parent",
      });

      const childScope = new EnterScopeHandler<Scope>({
        type: "EnterScope",
        pc,
        scope: "child",
      });

      const staticValue = new StaticStringHandler<Scope, Prop>({
        type: "StaticString",
        emitter,
        pc,
        prop: "value",
        value: "new scope",
      });

      rewriter.on("p.msg", parentScope);
      rewriter.on("p.msg", staticValue);
      rewriter.on("p.nest", childScope);
      rewriter.on("p.nest", staticValue);

      await rewriter.transform(src).arrayBuffer();

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        parent: [{ value: "new scope" }],
        child: [{ value: "new scope" }],
      });
    });
  });

  describe("EndScopeHandler", () => {
    it("should exit the current context scope if the element is found", async () => {
      const enterScope = new EnterScopeHandler<Scope>({
        type: "EnterScope",
        pc,
        scope: "parent",
      });

      const endScope = new EndScopeHandler<Scope>({
        type: "EndScope",
        pc,
      });

      const staticValue = new StaticStringHandler<Scope, Prop>({
        type: "StaticString",
        emitter,
        pc,
        prop: "value",
        value: "new scope",
      });

      rewriter.on("p.msg", enterScope);
      rewriter.on("p.msg", staticValue);

      rewriter.on("p.nest", endScope);
      rewriter.on("p.nest", staticValue);

      await rewriter.transform(src).arrayBuffer();

      expect(JSON.parse(emitter.toString())).toStrictEqual({
        root: [{ value: "new scope" }],
        parent: [{ value: "new scope" }],
      });
    });
  });

  describe("IncrementScopeIdHandler", () => {
    it("should increment scope's ID if the element is found", async () => {
      const newId = new IncrementScopeIdHandler<Scope>({
        type: "IncrementScopeId",
        pc,
      });

      const staticValue = new StaticStringHandler<Scope, Prop>({
        type: "StaticString",
        emitter,
        pc,
        prop: "value",
        value: "new scope",
      });

      rewriter.on("link", newId);
      rewriter.on("link", staticValue);

      await rewriter.transform(src).arrayBuffer();

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

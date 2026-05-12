import type { Emitter } from "./Emitter";
import type { ParserContext } from "./ParserContext";
import { normalizeText } from "./Text";
import { normalizeURL } from "./URL";

export interface ExtractHandler {
  element(el: Element): void;
  text(t: Text): void;
}

export type ExtractHandlerConfig<Scope extends string, Prop extends string> =
  | {
      type: "URLAttribute";
      prop: Prop;
      attr: string;
      baseUrl: string;
    }
  | {
      type: "StringAttribute";
      prop: Prop;
      attr: string;
    }
  | {
      type: "BufferedString";
      prop: Prop;
    }
  | {
      type: "StaticString";
      prop: Prop;
      value: string;
    }
  | {
      type: "EnterScope";
      scope: Scope;
    }
  | {
      type: "EndScope";
    }
  | {
      type: "IncrementScopeId";
    };

export type ExtractHandlerArgs<Scope extends string, Prop extends string> =
  | ((
      | { type: "EnterScope" }
      | { type: "EndScope" }
      | { type: "IncrementScopeId" }
    ) &
      ExtractHandlerConfig<Scope, Prop> & {
        pc: ParserContext<Scope>;
      })
  | ((
      | { type: "URLAttribute" }
      | { type: "StringAttribute" }
      | { type: "BufferedString" }
      | { type: "StaticString" }
    ) &
      ExtractHandlerConfig<Scope, Prop> & {
        emitter: Emitter<Scope, Record<Prop, string>>;
        pc: ParserContext<Scope>;
      });

export class URLAttributeHandler<Scope extends string, Prop extends string>
  implements ExtractHandler
{
  private emitter!: Emitter<Scope, Record<Prop, string>>;
  private pc!: ParserContext<Scope>;
  private prop!: Prop;
  private attr!: string;
  private baseUrl!: string;

  constructor({
    emitter,
    pc,
    prop,
    attr,
    baseUrl,
  }: { type: "URLAttribute" } & ExtractHandlerArgs<Scope, Prop>) {
    this.emitter = emitter;
    this.pc = pc;
    this.prop = prop;
    this.attr = attr;
    this.baseUrl = baseUrl;
  }

  element(el: Element) {
    const value = normalizeText(el.getAttribute(this.attr));
    if (!value) {
      return;
    }

    const href = normalizeURL(this.baseUrl, value);
    if (!href) {
      return;
    }

    const { scope, id } = this.pc.context();

    const data: Partial<Record<Prop, string>> = {};
    data[this.prop] = href.toString();

    this.emitter.set(scope, id, data);
  }

  text(_: Text) {}
}

export class StringAttributeHandler<Scope extends string, Prop extends string>
  implements ExtractHandler
{
  private emitter!: Emitter<Scope, Record<Prop, string>>;
  private pc!: ParserContext<Scope>;
  private prop!: Prop;
  private attr!: string;

  constructor({
    emitter,
    pc,
    prop,
    attr,
  }: { type: "StringAttribute" } & ExtractHandlerArgs<Scope, Prop>) {
    this.emitter = emitter;
    this.pc = pc;
    this.prop = prop;
    this.attr = attr;
  }

  element(el: Element) {
    const attr = normalizeText(el.getAttribute(this.attr));
    if (!attr) {
      return;
    }

    const { scope, id } = this.pc.context();

    const data: Partial<Record<Prop, string>> = {};
    data[this.prop] = attr;

    this.emitter.set(scope, id, data);
  }

  text(_: Text) {}
}

export class BufferedStringHandler<Scope extends string, Prop extends string>
  implements ExtractHandler
{
  private emitter!: Emitter<Scope, Record<Prop, string>>;
  private pc!: ParserContext<Scope>;
  private prop!: Prop;
  private buffer: Record<number, string> = {};

  constructor({
    emitter,
    pc,
    prop,
  }: { type: "BufferedString" } & ExtractHandlerArgs<Scope, Prop>) {
    this.emitter = emitter;
    this.pc = pc;
    this.prop = prop;
  }

  element(el: Element) {
    const { scope, id } = this.pc.context();

    el.onEndTag(() => {
      const value = normalizeText(this.buffer[id]);
      if (!value) {
        delete this.buffer[id];
        return;
      }

      const data: Partial<Record<Prop, string>> = {};
      data[this.prop] = value;

      this.emitter.set(scope, id, data);
      delete this.buffer[id];
    });
  }

  text(t: Text) {
    const { text } = t;
    if (!text) {
      return;
    }

    const { id } = this.pc.context();
    this.buffer[id] = (this.buffer[id] ?? "") + text;
  }
}

export class StaticStringHandler<Scope extends string, Prop extends string>
  implements ExtractHandler
{
  private emitter!: Emitter<Scope, Record<Prop, string>>;
  private pc!: ParserContext<Scope>;
  private prop!: Prop;
  private value!: string;

  constructor({
    emitter,
    pc,
    prop,
    value,
  }: { type: "StaticString" } & ExtractHandlerArgs<Scope, Prop>) {
    this.emitter = emitter;
    this.pc = pc;
    this.prop = prop;
    this.value = value;
  }

  element(_: Element) {
    const { scope, id } = this.pc.context();
    const data: Partial<Record<Prop, string>> = {};
    data[this.prop] = this.value;

    this.emitter.set(scope, id, data);
  }

  text(_: Text) {}
}

export class EnterScopeHandler<Scope extends string> implements ExtractHandler {
  private pc!: ParserContext<Scope>;
  private scope!: Scope;

  constructor({
    pc,
    scope,
  }: { type: "EnterScope" } & ExtractHandlerArgs<Scope, string>) {
    this.pc = pc;
    this.scope = scope;
  }

  element(_: Element) {
    this.pc.enterScope(this.scope);
  }

  text(_: Text) {}
}

export class EndScopeHandler<Scope extends string> implements ExtractHandler {
  private pc!: ParserContext<Scope>;

  constructor({
    pc,
  }: { type: "EndScope" } & ExtractHandlerArgs<Scope, string>) {
    this.pc = pc;
  }

  element(_: Element) {
    this.pc.endScope();
  }

  text(_: Text) {}
}

export class IncrementScopeIdHandler<Scope extends string>
  implements ExtractHandler
{
  private pc!: ParserContext<Scope>;

  constructor({
    pc,
  }: { type: "IncrementScopeId" } & ExtractHandlerArgs<Scope, string>) {
    this.pc = pc;
  }

  element(_: Element) {
    this.pc.incrementId();
  }

  text(_: Text) {}
}

export const createExtractHandlers = <
  Scope extends string,
  Prop extends string,
>({
  emitter,
  pc,
  configs,
}: {
  emitter: Emitter<Scope, Record<Prop, string>>;
  pc: ParserContext<Scope>;
  configs: [string, ExtractHandlerConfig<Scope, Prop>][];
}): [string, ExtractHandler][] => {
  const registry: [string, ExtractHandler][] = [];

  for (const [selector, config] of configs) {
    const typ = config.type;
    switch (typ) {
      case "URLAttribute":
        registry.push([
          selector,
          new URLAttributeHandler<Scope, Prop>({ emitter, pc, ...config }),
        ]);
        break;
      case "StringAttribute":
        registry.push([
          selector,
          new StringAttributeHandler<Scope, Prop>({ emitter, pc, ...config }),
        ]);
        break;
      case "BufferedString":
        registry.push([
          selector,
          new BufferedStringHandler<Scope, Prop>({ emitter, pc, ...config }),
        ]);
        break;
      case "StaticString":
        registry.push([
          selector,
          new StaticStringHandler<Scope, Prop>({ emitter, pc, ...config }),
        ]);
        break;
      case "EnterScope":
        registry.push([
          selector,
          new EnterScopeHandler<Scope>({ pc, ...config }),
        ]);
        break;
      case "EndScope":
        registry.push([
          selector,
          new EndScopeHandler<Scope>({ pc, ...config }),
        ]);
        break;
      case "IncrementScopeId":
        registry.push([
          selector,
          new IncrementScopeIdHandler<Scope>({ pc, ...config }),
        ]);
        break;

      default: {
        throw new Error(`Unsupported config type: ${typ}`);
      }
    }
  }

  return registry;
};

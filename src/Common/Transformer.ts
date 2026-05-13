import type { Emitter } from "./Emitter";
import {
  BufferedStringHandler,
  EndScopeHandler,
  EnterScopeHandler,
  type ExtractHandlerConfig,
  IncrementScopeIdHandler,
  StaticStringHandler,
  StringAttributeHandler,
  URLAttributeHandler,
} from "./Handlers";
import type { ParserContext } from "./ParserContext";

export class Transformer<Scope extends string, Prop extends string> {
  private emitter!: Emitter<Scope, Record<Prop, string>>;
  private rewriter!: HTMLRewriter;

  constructor(
    emitter: Emitter<Scope, Record<Prop, string>>,
    pc: ParserContext<Scope>,
    configs: [string, ExtractHandlerConfig<Scope, Prop>][],
  ) {
    this.emitter = emitter;
    this.rewriter = new HTMLRewriter();

    for (const [selector, config] of configs) {
      const typ = config.type;
      switch (typ) {
        case "URLAttribute": {
          this.rewriter.on(
            selector,
            new URLAttributeHandler<Scope, Prop>({ emitter, pc, ...config }),
          );
          break;
        }

        case "StringAttribute": {
          this.rewriter.on(
            selector,
            new StringAttributeHandler<Scope, Prop>({ emitter, pc, ...config }),
          );
          break;
        }

        case "BufferedString": {
          this.rewriter.on(
            selector,
            new BufferedStringHandler<Scope, Prop>({ emitter, pc, ...config }),
          );
          break;
        }

        case "StaticString": {
          this.rewriter.on(
            selector,
            new StaticStringHandler<Scope, Prop>({ emitter, pc, ...config }),
          );
          break;
        }

        case "EnterScope": {
          this.rewriter.on(
            selector,
            new EnterScopeHandler<Scope>({ pc, ...config }),
          );
          break;
        }

        case "EndScope": {
          this.rewriter.on(
            selector,
            new EndScopeHandler<Scope>({ pc, ...config }),
          );
          break;
        }

        case "IncrementScopeId": {
          this.rewriter.on(
            selector,
            new IncrementScopeIdHandler<Scope>({ pc, ...config }),
          );
          break;
        }

        default: {
          throw new Error(`Unsupported handler type: ${typ}`);
        }
      }
    }
  }

  async transform(src: Response): Promise<string> {
    return this.rewriter
      .transform(src)
      .arrayBuffer()
      .then(() => {
        return this.emitter.toString();
      });
  }
}

/**
 * Represents the current state within the parser context.
 *
 * @typeParam Scope - The type defining the possible parser scopes.
 */
export type CurrentContext<Scope> = {
  /**
   * The current scope in the parser. Immutable value.
   */
  readonly scope: Scope;

  /**
   * The current ID in the parser. Mutable value.
   */
  id: number;
};

/**
 * Manages the scope and state of the parser context.
 *
 * @typeParam Scope - The type defining the possible parser scopes.
 */
export class ParserContext<Scope extends string> {
  private stack: CurrentContext<Scope>[] = [];
  private readonly initialScope: Scope;

  /**
   * Initialize a new ParserContext instance.
   *
   * @param initialScope - The initial state of this context.
   */
  constructor(initialScope: Scope) {
    this.initialScope = initialScope;
    this.reset();
  }

  /**
   * Enters a new scope.
   *
   * @param scope - The new scope to enter.
   */
  enterScope(scope: Scope) {
    this.stack.push({
      scope,
      id: 0,
    });
  }

  /**
   * Leaves the current scope.
   */
  endScope() {
    if (this.stack.length > 1) {
      this.stack.pop();
    }
  }

  /**
   * Increments the current scope ID.
   */
  incrementId() {
    this.stack[this.stack.length - 1].id++;
  }

  /**
   * Decrements the current scope ID.
   */
  decrementId() {
    if (this.stack[this.stack.length - 1].id > 0) {
      this.stack[this.stack.length - 1].id--;
    }
  }

  /**
   * Returns the current state of the context.
   *
   * @returns The current parser context state.
   */
  context(): CurrentContext<Scope> {
    return { ...this.stack[this.stack.length - 1] };
  }

  /**
   * Resets the context to its initial state.
   */
  reset() {
    this.stack = [
      {
        scope: this.initialScope,
        id: 0,
      },
    ];
  }
}

/**
 * The interface for converting Emitter data into a string.
 *
 * @typeParam Items - Type of the data passed to the renderer.
 * @param items - The data of converting target.
 * @returns The rendered string from Emitter data.
 */
export type Renderer<Items> = (items: Items) => string;

/**
 * The initialize options for Emitter.
 *
 * @typeParam Items - Type of the data for processing by renderer.
 */
export type EmitterOptions<Items> = {
  /**
   * The function of data to string renderer.
   */
  renderer: Renderer<Items>;
};

/**
 * The collector that stores item properties grouped by scope and ID,
 * and outputs them as a string via the renderer.
 *
 * @typeParam Scope - The type used for categorization.
 * @typeParam Item - The schema definition of the properties stored in each item.
 */
export class Emitter<
  Scope extends string,
  Item extends Record<string, string>,
> {
  private datum = new Map<Scope, Map<number, Partial<Item>>>();
  private render: Renderer<Map<Scope, Map<number, Partial<Item>>>>;

  /**
   * Initializes a new Emitter instance.
   *
   * @param options - Initialization options.
   * @param options.renderer - The function that converts internal data into a string.
   */
  constructor({
    renderer,
  }: EmitterOptions<Map<Scope, Map<number, Partial<Item>>>>) {
    this.render = renderer;
  }

  /**
   * Sets or updates item properties for given scope and ID.
   *
   * @param scope - The target scope for the data.
   * @param id - The unique identifier for the item.
   * @param item - The partial properties to set or update.
   */
  set(scope: Scope, id: number, item: Partial<Item>) {
    let scopeData = this.datum.get(scope);
    if (!scopeData) {
      scopeData = new Map();
      this.datum.set(scope, scopeData);
    }

    const existing = scopeData.get(id) ?? {};

    scopeData.set(id, {
      ...existing,
      ...item,
    });
  }

  /**
   * Transforms the accumulated data using the renderer and returns the result.
   *
   * @returns The rendered string.
   */
  toString(): string {
    return this.render(this.datum);
  }
}

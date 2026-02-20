/**
 * The interface of the feed string emitter.
 */
export interface IEmitter<NS, PROP, VAL> {
  /**
   * Set `value` as `key` property.
   *
   * @param key - the property key
   * @param value - the property value
   */
  set: (key: PROP, value: VAL) => void;

  /**
   * Get the property value from internal state by `key`.
   *
   * @param key - the property key
   * @returns - the property value
   */
  get: (key: PROP) => VAL;

  /**
   * Add the key-value pair to ia stack of defined as Array property.
   *
   * This method only sets to key-value pair to current stack,
   * needs to call `emit` method if flush and append a stack to the Array property.
   *
   * @param ns - the namespace of Array property
   * @param key - the property key
   * @param value - the property value
   **/
  add: (ns: NS, key: PROP, value: VAL) => void;

  /**
   * Add stack value to Array property, and flush current internal stack.
   *
   * @param ns - the namespace of Array property
   */
  emit: (ns: NS) => void;

  /**
   * Makes to the feed string.
   *
   * @returns - the feed string
   */
  toString: () => string;
}

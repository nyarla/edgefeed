/**
 * Escape string for JSON.
 *
 * @param {string} src - the raw string to using on JSON.
 * @returns {string} - the escaped string that can be used as JSON string.
 */

export const escapeJSON = (src: string): string =>
  src
    ? src
        .replace(/\t+/g, "")
        // biome-ignore lint/suspicious/noControlCharactersInRegex: this code remove unsafe string from `src`
        .replace(/[\u0000-\u001F]/g, "")
        .replace(/(["\\])/g, (_, p1) => `\\${p1}`)
    : "";

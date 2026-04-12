/**
 * Normalizes a string into a single-line string.
 *
 * This function is designed to process strings extracted from HTML,
 * replacing all whitespace and newline sequences with a single space,
 * and trimming the result.
 *
 * @param src - The string extracted from HTML.
 * @returns The normalized single-line string.
 */
export const normalize = (src: string): string => {
  if (!src) {
    return "";
  }

  return (
    src
      // biome-ignore lint/suspicious/noControlCharactersInRegex: this code remove unsafe string from `src`
      .replace(/[\s\u0000-\u001F]+/g, " ")
      .trim()
      .replace(/([\\"])/g, "\\$1")
  );
};

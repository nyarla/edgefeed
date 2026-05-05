/**
 * Normalize a string,
 *
 * Replace sequence of whitespace (` `, `\t`, `\n` or `\r`) with a single space
 * and trims leading/trailing whitespace.
 *
 * Returns an empty string if the input is null or undefined.
 *
 * @param src - The inputs string to normalize.
 * @returns The normalized string.
 **/
export const normalizeText = (src?: string | null): string =>
  (src ?? "").replace(/\s+/g, " ").trim();

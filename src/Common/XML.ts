const ESCAPE_RE = /[&<>"']/g;
const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

const UNESCAPE_RE = /&(#[xX]?[0-9a-fA-F]+|lt|gt|amp|apos|quot);/g;
const UNESCAPE_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

/**
 * Escapes special characters to XML entities.
 *
 * @param src - The input string to escape.
 * @returns The XML-safe string.
 */
export const escapeXML = (src: string): string =>
  src.replace(ESCAPE_RE, (char: string) => ESCAPE_MAP[char] || char);

/**
 * Unescape XML entities (both named and numeric references) to plain text.
 *
 * Invalid or out-of-range code points are replaced with the replacement characters '\uFFFD'.
 *
 * @param src - The input string containing XML entities.
 * @returns The unescaped plain text.
 * */
export const unescapeXML = (src: string): string => {
  if (!src.includes("&")) {
    return src;
  }

  return src.replace(UNESCAPE_RE, (sub: string, p1: string) => {
    if (p1[0] === "#") {
      const hex = p1[1] === "x" || p1[1] === "X";
      const codePoint = Number.parseInt(p1.slice(hex ? 2 : 1), hex ? 16 : 10);

      const isControl =
        codePoint < 0x20 &&
        !(codePoint === 0x9 || codePoint === 0xa || codePoint === 0xd);

      return !Number.isNaN(codePoint) && codePoint <= 0x10ffff && !isControl
        ? String.fromCodePoint(codePoint)
        : "\uFFFD";
    }

    return UNESCAPE_MAP[p1] || sub;
  });
};

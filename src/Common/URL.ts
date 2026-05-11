/**
 * normalizes a URL by resolving the given path against a base URL.
 *
 * @param baseUrl - The base URL to resolve against.
 * @param src - The URL or relative path to resolve.
 * @returns - A normalized URL, or `null` if the input is empty or invalid.
 */
export const normalizeURL = (
  baseUrl: string,
  src?: string | null,
): URL | null => {
  if (!src) {
    return null;
  }

  try {
    if (src.startsWith("https://") || src.startsWith("http://")) {
      return new URL(src);
    }

    if (src.startsWith("//")) {
      return new URL(`https:${src}`);
    }

    if (src.startsWith("/")) {
      const base = new URL(baseUrl);
      return new URL(`${base.protocol}//${base.hostname}${src}`);
    }

    if (src.startsWith("#")) {
      return new URL(`${baseUrl}${src}`);
    }

    return new URL(src, baseUrl);
  } catch (_: unknown) {
    return null;
  }
};

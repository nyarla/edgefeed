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
    return new URL(src, baseUrl);
  } catch (_: unknown) {
    return null;
  }
};

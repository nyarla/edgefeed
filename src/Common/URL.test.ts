import { describe, expect, it } from "vitest";
import { normalizeURL } from "./URL";

describe("normalizeURL", () => {
  const baseUrl = "https://www.example.com/foo";

  it("should resolve a relative path against a base URL", () => {
    const result = normalizeURL(baseUrl, "foo/image.jpg");
    expect(result?.toString()).toBe("https://www.example.com/foo/image.jpg");
  });

  it("should resolve a relative path started with `/` against a base URL", () => {
    const result = normalizeURL(baseUrl, "/image.png");
    expect(result?.toString()).toBe("https://www.example.com/image.png");
  });

  it("should resolve a absolute path as URL", () => {
    const result = normalizeURL(
      baseUrl,
      "https://another.example.com/bar/image.jpg",
    );
    expect(result?.toString()).toBe(
      "https://another.example.com/bar/image.jpg",
    );
  });

  it("should handle absolute URI without protocol scheme", () => {
    const result = normalizeURL(baseUrl, "//example.com/image.jpg");
    expect(result?.toString()).toBe("https://example.com/image.jpg");
  });

  it("should handle absolute path without hostname", () => {
    const result = normalizeURL(baseUrl, "/bar/image.jpg");
    expect(result?.toString()).toBe("https://www.example.com/bar/image.jpg");
  });

  it("should handle number sign as link pointer", () => {
    const result = normalizeURL(baseUrl, "#foo");
    expect(result?.toString()).toBe("https://www.example.com/foo#foo");
  });

  it("should return null if url string is null or undefined", () => {
    expect(normalizeURL(baseUrl, null)).toBeNull();
    expect(normalizeURL(baseUrl, undefined)).toBeNull();
  });

  it("should return null for invalid URL inputs", () => {
    expect(normalizeURL("/not-a-url", "example.com/")).toBeNull();
  });
});

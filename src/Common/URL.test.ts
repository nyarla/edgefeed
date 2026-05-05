import { describe, expect, it } from "vitest";
import { normalizeURL } from "./URL";

describe("normalizeURL", () => {
  const baseUrl = "https://www.example.com/foo";

  it("should resolve a relative path against a base URL", () => {
    const result = normalizeURL(baseUrl, "foo/image.jpg");
    expect(result?.toString()).toBe("https://www.example.com/foo/image.jpg");
  });

  it("should handle an absolute URL as src", () => {
    const result = normalizeURL(
      baseUrl,
      "https://another.example.com/bar/image.jpg",
    );
    expect(result?.toString()).toBe(
      "https://another.example.com/bar/image.jpg",
    );
  });

  it("should return null if src is null or undefined", () => {
    expect(normalizeURL(baseUrl, null)).toBeNull();
    expect(normalizeURL(baseUrl, undefined)).toBeNull();
  });

  it("should return null for invalid URL inputs", () => {
    expect(normalizeURL("/not-a-url", "example.com/")).toBeNull();
    expect(normalizeURL("#not-a-url", "https://www.example.com/")).toBeNull();
    expect(normalizeURL("//not-a-url", "https://www.example.com/")).toBeNull();
  });
});

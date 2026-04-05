import { describe, expect, it } from "vitest";

import {
  createCirclePageRequest,
  createNewItemsRequest,
  createRankingPageRequest,
} from "./Request";

describe("Request", () => {
  it("createCirclePageRequest", () => {
    const r = createCirclePageRequest("0", "app/version (0.01)");

    expect(r).toBeInstanceOf(Request);
    expect(r.url).toBe(
      "https://www.melonbooks.co.jp/circle/index.php?circle_id=0",
    );

    expect(r.headers.get("User-Agent")).toBe("app/version (0.01)");
    expect(r.headers.get("Cookie")).toBe("AUTH_ADULT=1");
  });

  it("createRankingPageRequest", () => {
    const r = createRankingPageRequest(0, 1, "app/version (0.01)");

    expect(r).toBeInstanceOf(Request);
    expect(r.url).toBe(
      "https://www.melonbooks.co.jp/ranking/index.php?period=1&type=0&mode=category&category=1",
    );

    expect(r.headers.get("User-Agent")).toBe("app/version (0.01)");
    expect(r.headers.get("Cookie")).toBe("AUTH_ADULT=1");
  });

  it("createCirclePageRequest#new", () => {
    const r = createNewItemsRequest("new", 1, "app/version (0.01)");

    expect(r).toBeInstanceOf(Request);
    expect(r.url).toBe(
      "https://www.melonbooks.co.jp/new/arrival.php?sort_type=0&category=1",
    );

    expect(r.headers.get("User-Agent")).toBe("app/version (0.01)");
    expect(r.headers.get("Cookie")).toBe("AUTH_ADULT=1");
  });

  it("createCirclePageRequest#reserve", () => {
    const r = createNewItemsRequest("reserve", 1, "app/version (0.01)");

    expect(r).toBeInstanceOf(Request);
    expect(r.url).toBe(
      "https://www.melonbooks.co.jp/reserve/reserve.php?sort_type=0&category=1",
    );

    expect(r.headers.get("User-Agent")).toBe("app/version (0.01)");
    expect(r.headers.get("Cookie")).toBe("AUTH_ADULT=1");
  });
});

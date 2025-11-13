import { describe, expect, it } from "vitest";
import {
  makeCirclePageRequest,
  makeNewItemsPageRequest,
  makeRankingPageRequest,
} from "./request";

describe("melonbooks/request", () => {
  it("makeCirclePageRequest", () => {
    const ua = "test/0.0";
    const r = makeCirclePageRequest("1");

    expect(r).instanceOf(Request);
    expect(r.url).toBe(
      "https://www.melonbooks.co.jp/circle/index.php?circle_id=1",
    );
    expect(r.method).toBe("GET");
    expect(r.redirect).toBe("follow");
    expect(r.headers?.get("Cookie")).toBe("AUTH_ADULT=1");
    expect(r.headers?.get("User-Agent")).not.toBe(ua);

    const r2 = makeCirclePageRequest("2", ua);
    expect(r2.url).toBe(
      "https://www.melonbooks.co.jp/circle/index.php?circle_id=2",
    );
    expect(r2.headers?.get("User-Agent")).toBe(ua);
  });

  it("makeRankingPageRequest", () => {
    const ua = "test/0.0";
    const r1 = makeRankingPageRequest(1, 2);

    expect(r1).instanceof(Request);
    expect(r1.url).toBe(
      "https://www.melonbooks.co.jp/ranking/index.php?period=1&type=1&mode=category&category=2",
    );

    expect(r1.method).toBe("GET");
    expect(r1.redirect).toBe("follow");
    expect(r1.headers?.get("Cookie")).toBe("AUTH_ADULT=1");
    expect(r1.headers?.get("User-Agent")).not.toBe(ua);

    const r2 = makeRankingPageRequest(1, 2, ua);
    expect(r2.url).toBe(r1.url);
    expect(r2.headers?.get("User-Agent")).toBe(ua);
  });

  it("makeNewItemsPageRequest", () => {
    const ua = "test/0.0";
    const r1 = makeNewItemsPageRequest("new", 1);

    expect(r1).instanceOf(Request);
    expect(r1.redirect).toBe("follow");
    expect(r1.headers?.get("Cookie")).toBe("AUTH_ADULT=1");
    expect(r1.headers?.get("User-Agent")).not.toBe(ua);

    expect(r1.url).toBe(
      "https://www.melonbooks.co.jp/new/arrival.php?sort_type=0&category=1",
    );

    const r2 = makeNewItemsPageRequest("new", 1, ua);
    expect(r2.url).toBe(r1.url);
    expect(r2.headers?.get("User-Agent")).toBe(ua);

    const r3 = makeNewItemsPageRequest("reserve", 2);
    expect(r3).instanceOf(Request);
    expect(r3.redirect).toBe("follow");
    expect(r3.headers?.get("Cookie")).toBe("AUTH_ADULT=1");
    expect(r3.headers?.get("User-Agent")).not.toBe(ua);

    expect(r3.url).toBe(
      "https://www.melonbooks.co.jp/reserve/reserve.php?sort_type=0&category=2",
    );

    const r4 = makeNewItemsPageRequest("reserve", 2, ua);
    expect(r4.url).toBe(r3.url);
    expect(r4.headers?.get("User-Agent")).toBe(ua);
  });
});

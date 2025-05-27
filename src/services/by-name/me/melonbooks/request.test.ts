import { describe, expect, it } from "vitest";
import { makeCirclePageRequest } from "./request";

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
});

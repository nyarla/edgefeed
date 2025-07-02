import { describe, expect, it } from "vitest";

import { makeFLStudioNewRequest } from "./request";

describe("flstudio-news/request", () => {
  it("common test", () => {
    const r = makeFLStudioNewRequest();

    expect(r.method).toBe("GET");
    expect(r.redirect).toBe("follow");
    expect(r.headers.get("User-Agent")).toBeTruthy();
  });

  it("with User-Agent", () => {
    const r = makeFLStudioNewRequest("example/0.01");

    expect(r.headers.get("User-Agent")).toBe("example/0.01");
  });
});

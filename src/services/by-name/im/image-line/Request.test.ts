import { describe, expect, it } from "vitest";

import { createFLStudioNewRequest } from "./Request";

describe("flstudio-news/request", () => {
  it("common test", () => {
    const r = createFLStudioNewRequest();

    expect(r.method).toBe("GET");
    expect(r.redirect).toBe("follow");
    expect(r.headers.get("User-Agent")).toBeTruthy();
  });

  it("with User-Agent", () => {
    const r = createFLStudioNewRequest("example/0.01");

    expect(r.headers.get("User-Agent")).toBe("example/0.01");
  });
});

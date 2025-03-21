import { describe, expect, it } from "vitest";

import { Hono } from "hono";
import { type Bindings, middleware as basicAuth } from "./basic-auth";

describe("basic-auth", () => {
  const app = new Hono<{ Bindings: Bindings }>();
  app.get("/", basicAuth());
  app.get("/", (c) => c.text("ok"));

  it("if EDGEFEED_BASIC_AUTH is `off`, no activate basic auth", async () => {
    const res = await app.request("/", {}, { EDGEFEED_BASIC_AUTH: "off" });
    expect(await res.text()).toBe("ok");
  });

  it("if middleware is active, the path requires basic auth", async () => {
    const res = await app.request("/", {}, {});
    expect(res.status).toBe(401);
  });

  it("if username or password did not specified by env, this middleware throws 401", async () => {
    const noUser = await app.request("/", {}, { EDGEFEED_PASSWORD: "123" });
    expect(noUser.status).toBe(401);

    const noPasswd = await app.request("/", {}, { EDGEFEED_USERNAME: "foo" });
    expect(noPasswd.status).toBe(401);
  });

  it("if app received valid username and password, the app pass through this request", async () => {
    const req = new Request("http://localhost");
    req.headers.set(
      "Authorization",
      `Basic ${Buffer.from("foo:123").toString("base64")}`,
    );
    const res = await app.request(
      req,
      {},
      {
        EDGEFEED_USERNAME: "foo",
        EDGEFEED_PASSWORD: "123",
      },
    );

    expect(await res.text()).toBe("ok");
  });
});

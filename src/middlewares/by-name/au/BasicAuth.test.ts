import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { type BasicAuthBindings, createBasicAuthMiddleware } from "./BasicAuth";

describe("BasicAuth", () => {
  const app = new Hono<{ Bindings: BasicAuthBindings }>();
  const basicAuth = createBasicAuthMiddleware();

  app.get("/", basicAuth, (c) => c.text("ok"));

  const env = {
    EDGEFEED_BASIC_AUTH_USERNAME: "foo",
    EDGEFEED_BASIC_AUTH_PASSWORD: "bar",
  };

  it("if we use this middleware, the request of this app requires basic authentication", async () => {
    const res = await app.request("/", {}, env);
    expect(res.ok).toBeFalsy();
    expect(res.status).toBe(401);
  });

  it("if the request has valid Authentication header, this request passed to basic auth middleawre", async () => {
    const req = new Request("https://example.com/");
    req.headers.set(
      "Authorization",
      `Basic ${Buffer.from("foo:bar").toString("base64")}`,
    );
    const res = await app.fetch(req, env);

    expect(res.ok).toBeTruthy();
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });
});

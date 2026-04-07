import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createAuthenticateMiddleware } from "./Authentication";
import {
  createTokenAuthenticator,
  type TokenAuthBindings,
  verifyToken,
} from "./TokenAuth";

describe("TokenAuth#verifyToken", () => {
  it("token is valid", async () => {
    const encoder = new TextEncoder();
    const challenge = encoder.encode("12345");
    const token = encoder.encode("12345");

    expect(verifyToken(challenge, token)).toBeTruthy();
  });

  it("token is invalid#wrong token", async () => {
    const encoder = new TextEncoder();
    const challenge = encoder.encode("23456");
    const token = encoder.encode("12345");

    expect(verifyToken(challenge, token)).toBeFalsy();
  });

  it("token is invalid#wrong length", async () => {
    const encoder = new TextEncoder();
    const challenge = encoder.encode("1");
    const token = encoder.encode("12345");

    expect(verifyToken(challenge, token)).toBeFalsy();
  });
});

describe("createTokenAuthorizor", () => {
  const tokenAuth = createAuthenticateMiddleware(createTokenAuthenticator());
  const app = new Hono<{ Bindings: TokenAuthBindings }>();

  app.get("/", tokenAuth, (c) => c.text("ok"));

  it("verify token ok", async () => {
    const req = new Request("https://example.com/?token=ABC12345");
    const res = await app.fetch(req, { EDGEFEED_TOKEN_AUTH_TOKEN: "ABC12345" });

    expect(res?.ok).toBeTruthy();
    expect(await res.text()).toBe("ok");
  });

  it("verify token ok", async () => {
    const req = new Request("https://example.com/?token=BCD12345");
    const res = await app.fetch(req, { EDGEFEED_TOKEN_AUTH_TOKEN: "ABC12345" });

    expect(res?.ok).toBeFalsy();
    expect(await res.text()).toBe("this page requires authentication.");
  });
});

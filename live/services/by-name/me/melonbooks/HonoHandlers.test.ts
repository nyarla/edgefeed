import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createInMemoryCacheInitializer } from "@/middlewares/by-name/re/InMemoryCache";
import { createHonoHandler } from "@/services/by-name/me/melonbooks/HonoHandlers";

const app = new Hono();
const open = createInMemoryCacheInitializer(0);

app.get(
  "/circle/:id",
  createHonoHandler({
    baseUrl: "http://localhost/",
    kind: "circle",
    format: "json",
    open,
  }),
);

app.get(
  "/ranking/:kind/:id",
  createHonoHandler({
    baseUrl: "https://localhost/",
    kind: "ranking",
    format: "json",
    open,
  }),
);

app.get(
  "/new/:kind/:type",
  createHonoHandler({
    baseUrl: "http://localhost/",
    kind: "news",
    format: "json",
    open,
  }),
);

describe("circle page handler", async () => {
  it("400 bad request", async () => {
    const res = await app.request("/circle/foo", {}, {});

    expect(res.ok).toBeFalsy();
    expect(res.status).toBe(400);
    expect(await res.text(), "the circle id is not number: foo");
  });

  it("200 ok", async () => {
    const res = await app.request("/circle/3753", {}, {});

    expect(res.ok).toBeTruthy();
    expect(res.status).toBe(200);
    expect(await res.json()).toBeInstanceOf(Object);
  });
});

describe("ranking handler", async () => {
  it("400 bad request#kind", async () => {
    const res = await app.request("/ranking/foo/bar", {}, {});

    expect(res.ok).toBeFalsy();
    expect(res.status).toBe(400);
    expect(await res.text(), "the ranking category id not number: foo");
  });

  it("400 bad request#id", async () => {
    const res = await app.request("/ranking/9/bar", {}, {});

    expect(res.ok).toBeFalsy();
    expect(res.status).toBe(400);
    expect(await res.text(), "the ranking type id not number: bar");
  });

  it("200 ok", async () => {
    const res = await app.request("/ranking/9/0", {}, {});

    expect(res.ok).toBeTruthy();
    expect(res.status).toBe(200);
    expect(await res.json()).toBeInstanceOf(Object);
  });
});

describe("new items handler", async () => {
  it("400 bad request#kind", async () => {
    const res = await app.request("/new/foo/bar", {}, {});

    expect(res.ok).toBeFalsy();
    expect(res.status).toBe(400);
    expect(await res.text(), "the category id is not number: foo");
  });

  it("400 bad request#type", async () => {
    const res = await app.request("/new/9/foo", {}, {});

    expect(res.ok).toBeFalsy();
    expect(res.status).toBe(400);
    expect(
      await res.text(),
      "the type of new items does not match to 'reserve' or 'new': foo",
    );
  });

  it("200 ok#new", async () => {
    const res = await app.request("/new/9/new", {}, {});

    expect(res.ok).toBeTruthy();
    expect(res.status).toBe(200);
    expect(await res.json()).toBeInstanceOf(Object);
  });

  it("200 ok#reserve", async () => {
    const res = await app.request("/new/9/reserve", {}, {});

    expect(res.ok).toBeTruthy();
    expect(res.status).toBe(200);
    expect(await res.json()).toBeInstanceOf(Object);
  });
});

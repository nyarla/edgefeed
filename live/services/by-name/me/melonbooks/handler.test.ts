import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import {
  circlePageToJSONFeed,
  newItemsPageToJSONFeed,
  rankingPageToJSONFeed,
} from "@/services/by-name/me/melonbooks/handlers";

const app = new Hono();

app.get("/circle/:id", circlePageToJSONFeed("https://example.com/"));
app.get("/new/:category/:kind", newItemsPageToJSONFeed("https://example.com/"));
app.get(
  "/ranking/:category/:type",
  rankingPageToJSONFeed("https://example.com/"),
);

describe("circlePageToJSONFeed", () => {
  it("live request", async () => {
    const res = await app.request("/circle/3753", {}, {});

    expect(res.ok).toBeTruthy();
    expect(res.status).toBe(200);
    expect(await res?.json()).toBeTruthy();
  });

  it("invalid url", async () => {
    const res = await app.request("/circle/invalid", {}, {});

    expect(res.ok).not.toBeTruthy();
    expect(res.status).toBe(400);
    expect(await res?.text()).toBe("circle id should be the number");
  });
});

describe("newItemsPageToJSONFeed", () => {
  it("live test: reserve", async () => {
    const res = await app.request("/new/9/reserve");

    expect(res.ok).toBeTruthy();
    expect(res.status).toBe(200);
    expect(await res?.json()).toBeTruthy();
  });

  it("live test: new", async () => {
    const res = await app.request("/new/9/new");

    expect(res.ok).toBeTruthy();
    expect(res.status).toBe(200);
    expect(await res?.json()).toBeTruthy();
  });

  it("invalid url: category", async () => {
    const res1 = await app.request("/new/unknown/new", {}, {});

    expect(res1.ok).toBeFalsy();
    expect(res1.status).toBe(400);
    expect(await res1?.text()).toBe("The category id should be a number");

    const res2 = await app.request("/new/unknown/reserve", {}, {});

    expect(res2.ok).toBeFalsy();
    expect(res2.status).toBe(400);
    expect(await res2?.text()).toBe("The category id should be a number");
  });

  it("invalid url: kind", async () => {
    const res = await app.request("/new/9/unknown", {}, {});

    expect(res.ok).toBeFalsy();
    expect(res.status).toBe(400);
    expect(await res?.text()).toBe(
      "The 'kind' of page should be a 'reserve' or 'new', but this value is: unknown",
    );
  });
});

describe("rankingPageToJSONFeed", () => {
  it("live test", async () => {
    const res = await app.request("/ranking/9/2", {}, {});

    expect(res.ok).toBeTruthy();
    expect(res.status).toBe(200);
    expect(await res?.json()).toBeTruthy();
  });

  it("invalid url: category", async () => {
    const res = await app.request("/ranking/unknown/2", {}, {});

    expect(res.ok).toBeFalsy();
    expect(res.status).toBe(400);
    expect(await res?.text()).toBe("The category id should be a number");
  });

  it("invalid url: type", async () => {
    const res = await app.request("/ranking/9/unknown", {}, {});

    expect(res.ok).toBeFalsy();
    expect(res.status).toBe(400);
    expect(await res?.text()).toBe("The type id should be a number");
  });
});

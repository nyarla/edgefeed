import { Hono } from "hono";
import { describe, expect, it } from "vitest";
import { createInMemoryCacheInitializer } from "@/middlewares/by-name/re/InMemoryCache";
import { createHonoHandler } from "@/services/by-name/im/image-line/HonoHandler";

const app = new Hono();
const open = createInMemoryCacheInitializer(0);

app.get(
  "/",
  createHonoHandler({
    baseUrl: "http://localhost",
    format: "json",
    open,
  }),
);

describe("common", () => {
  it("200 ok", async () => {
    const res = await app.request("/", {}, {});

    expect(res.ok).toBeTruthy();
    expect(res.status).toBe(200);
    expect(await res.json()).toBeInstanceOf(Object);
  });
});

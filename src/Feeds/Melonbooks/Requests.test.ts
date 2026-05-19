import { describe, expect, it } from "vitest";

import {
  createArrivalsRankingRequest,
  createCirclePageRequest,
  createNewArrivalItemsRequest,
  createNewReserveItemsRequest,
  createRequest,
  createReserveRankingRequest,
} from "./Requests";

describe("createRequest", () => {
  it("should instantiate a Request object", () => {
    const r = createRequest("https://example.com/foo", "edgefeed/0.0.1");

    expect(r).toBeInstanceOf(Request);
    expect(r.url).toBe("https://example.com/foo");
    expect(r.headers.get("User-Agent")).toBe("edgefeed/0.0.1");
    expect(r.headers.get("Cookie")).toBe("AUTH_ADULT=1");
  });

  it("should instantiate a Request for the Circle page", () => {
    const r = createCirclePageRequest("0", "edgefeed/0.0.1");
    const href = new URL(r.url);

    expect(r).toBeInstanceOf(Request);
    expect(href.protocol).toBe("https:");
    expect(href.hostname).toBe("www.melonbooks.co.jp");
    expect(href.pathname).toBe("/circle/index.php");
    expect(href.searchParams.get("circle_id")).toBe("0");
  });

  it("should instantiate a Request for a new reserve items page", () => {
    const r = createNewReserveItemsRequest("0", "edgefeed/0.0.1");
    const href = new URL(r.url);

    expect(r).toBeInstanceOf(Request);
    expect(href.protocol).toBe("https:");
    expect(href.hostname).toBe("www.melonbooks.co.jp");
    expect(href.pathname).toBe("/reserve/reserve.php");
    expect(href.searchParams.get("sort_type")).toBe("0");
    expect(href.searchParams.get("category")).toBe("0");
  });

  it("should instantiate a Request for a new arraival items page", () => {
    const r = createNewArrivalItemsRequest("0", "edgefeed/0.0.1");
    const href = new URL(r.url);

    expect(r).toBeInstanceOf(Request);
    expect(href.protocol).toBe("https:");
    expect(href.hostname).toBe("www.melonbooks.co.jp");
    expect(href.pathname).toBe("/new/arrival.php");
    expect(href.searchParams.get("sort_type")).toBe("0");
    expect(href.searchParams.get("category")).toBe("0");
  });

  it("should instantiate a Request for the reserve ranking page", () => {
    const r = createReserveRankingRequest("0", "edgefeed/0.0.1");
    const href = new URL(r.url);

    expect(r).toBeInstanceOf(Request);
    expect(href.protocol).toBe("https:");
    expect(href.hostname).toBe("www.melonbooks.co.jp");
    expect(href.pathname).toBe("/ranking/index.php");

    expect(href.searchParams.get("period")).toBe("1");
    expect(href.searchParams.get("type")).toBe("2");
    expect(href.searchParams.get("mode")).toBe("category");
    expect(href.searchParams.get("category")).toBe("0");
  });

  it("should instantiate a Request for the arrivals ranking page", () => {
    const r = createArrivalsRankingRequest("0", "edgefeed/0.0.1");
    const href = new URL(r.url);

    expect(r).toBeInstanceOf(Request);
    expect(href.protocol).toBe("https:");
    expect(href.hostname).toBe("www.melonbooks.co.jp");
    expect(href.pathname).toBe("/ranking/index.php");

    expect(href.searchParams.get("period")).toBe("1");
    expect(href.searchParams.get("type")).toBe("1");
    expect(href.searchParams.get("mode")).toBe("category");
    expect(href.searchParams.get("category")).toBe("0");
  });
});

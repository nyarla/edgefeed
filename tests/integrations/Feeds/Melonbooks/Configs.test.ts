import { describe, expect, it } from "vitest";
import { Emitter } from "@/Common/Emitter";
import { ParserContext } from "@/Common/ParserContext";
import { Transformer } from "@/Common/Transformer";
import { DumpRenderer } from "@/Common/Renderer";
import { configs } from "@/Feeds/Melonbooks/Configs";
import type { Item, Prop, Scope } from "@/Feeds/Melonbooks/Types";

import fixture from "./fixture.html";

describe("Melonbooks", () => {
  describe("rules", async () => {
    const emitter = new Emitter<Scope, Item>({ renderer: DumpRenderer });
    const pc = new ParserContext<Scope>("global");

    const transformer = new Transformer<Scope, Prop>(emitter, pc, configs);
    const src = new Response(fixture, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });

    const payload = JSON.parse(await transformer.transform(src));

    it("should extract a page URL", async () => {
      expect(payload?.page?.[0]?.pageUrl).toBe(
        "https://www.melonbooks.co.jp/circle/index.php?circle_id=3753",
      );
    });

    it("should extract a page title", () => {
      expect(payload?.page?.[0]?.pageTitle).toBe("GRINP");
    });

    it("should extract the product ID", () => {
      expect(payload?.product?.[0]).toBeNull();

      for (const { productId } of payload?.product?.slice(1) ?? []) {
        expect(productId).toMatch(/^product_\d+$/);
      }
    });

    it("should extract the thumbnail URL", () => {
      expect(payload?.product?.[0]).toBeNull();

      for (const { productThumbnail } of payload?.product?.slice(1) ?? []) {
        expect(productThumbnail).toMatch(
          /https:\/\/melonbooks.akamaized.net\/user_data\/packages\/resize_image\.php\?/,
        );
      }
    });

    it("should extract the product URL", () => {
      expect(payload?.product?.[0]).toBeNull();

      for (const { productUrl } of payload?.product?.slice(1) ?? []) {
        expect(productUrl).toMatch(
          /^https:\/\/www.melonbooks.co.jp\/detail\/detail\.php/,
        );
      }
    });

    it("should extract the product title", () => {
      expect(payload?.product?.[0]).toBeNull();

      for (const { productTitle } of payload?.product?.slice(1) ?? []) {
        expect(productTitle).toBeTruthy();
      }
    });

    it("should extract the product author", () => {
      expect(payload?.product?.[0]).toBeNull();

      for (const { productAuthor } of payload?.product?.slice(1) ?? []) {
        expect(productAuthor).toBeTruthy();
      }
    });

    it("should extract the product kind", () => {
      expect(payload?.product?.[0]).toBeNull();

      for (const { productKind } of payload?.product?.slice(1) ?? []) {
        expect(productKind).toBeTruthy();
      }
    });

    it("should extract the sales status", () => {
      expect(payload?.product?.[0]).toBeNull();

      for (const { productSalesStatus } of payload?.product?.slice(1) ?? []) {
        expect(productSalesStatus).toBeTruthy();
      }
    });

    it("should extract the sales price", () => {
      expect(payload?.product?.[0]).toBeNull();

      for (const { productPrice } of payload?.product?.slice(1) ?? []) {
        expect(productPrice).toBeTruthy();
      }
    });
  });
});

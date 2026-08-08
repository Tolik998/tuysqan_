import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { categories, menuItems, promotions, setItems } from "@/data/menu";

describe("imported menu", () => {
  it("contains the complete PDF and sushi catalogue", () => {
    expect(categories).toHaveLength(18);
    expect(menuItems).toHaveLength(137);
    expect(setItems).toHaveLength(25);
  });

  it("has unique identifiers and slugs", () => {
    expect(new Set(menuItems.map((item) => item.id)).size).toBe(
      menuItems.length,
    );
    expect(new Set(menuItems.map((item) => item.slug)).size).toBe(
      menuItems.length,
    );
    expect(new Set(categories.map((category) => category.slug)).size).toBe(
      categories.length,
    );
  });

  it("references valid categories and positive integer prices", () => {
    const ids = new Set(categories.map((category) => category.id));
    for (const item of menuItems) {
      expect(ids.has(item.categoryId), item.slug).toBe(true);
      expect(Number.isInteger(item.price), item.slug).toBe(true);
      expect(item.price, item.slug).toBeGreaterThan(0);
      expect(item.nameRu.length, item.slug).toBeGreaterThan(1);
    }
  });

  it("references valid items from every sushi set", () => {
    const itemSlugs = new Set(menuItems.map((item) => item.slug));
    const setSlugs = new Set(
      menuItems
        .filter((item) => item.categoryId === "sushi-sets")
        .map((item) => item.slug),
    );
    for (const item of setItems) {
      expect(setSlugs.has(item.setId), item.setId).toBe(true);
      expect(itemSlugs.has(item.itemSlug), item.itemSlug).toBe(true);
      expect(item.quantity, item.itemSlug).toBeGreaterThan(0);
    }
  });

  it("uses the matching source artwork for every sushi set", () => {
    const setImages = Object.fromEntries(
      menuItems
        .filter((item) => item.categoryId === "sushi-sets")
        .map((item) => [item.slug, item.imageUrl]),
    );
    expect(setImages).toMatchObject({
      "grand-tuysqan-set": "/promos/grand-tuysqan.jpeg",
      "light-mix-set": "/promos/light-mix.jpeg",
      "lux-set": "/promos/lux-set.jpeg",
      "tempura-party-set": "/promos/tempura-party.jpeg",
      "hot-mix-set": "/promos/hot-mix.jpeg",
      "japanese-fairy-tale-set": "/promos/japanese-fairy-tale.jpeg",
    });
  });

  it("ships every referenced local image", () => {
    const imageUrls = [
      ...menuItems.map((item) => item.imageUrl),
      ...promotions.map((promotion) => promotion.imageUrl),
    ].filter((url): url is string => Boolean(url?.startsWith("/")));

    for (const url of imageUrls) {
      expect(
        existsSync(join(process.cwd(), "public", url.replace(/^\//, ""))),
        url,
      ).toBe(true);
    }
  });
});

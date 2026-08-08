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
      "grand-tuysqan-set": "/promos/grand-tuysqan-clean-v2.jpg",
      "light-mix-set": "/promos/light-mix-clean-v2.jpg",
      "lux-set": "/promos/lux-set-clean-v2.jpg",
      "tempura-party-set": "/promos/tempura-party-clean-v2.jpg",
      "hot-mix-set": "/promos/hot-mix-clean-v2.jpg",
      "japanese-fairy-tale-set": "/promos/japanese-fairy-tale.jpeg",
    });
  });

  it("uses individual generated artwork for every roll", () => {
    const rollImages = Object.fromEntries(
      menuItems
        .filter((item) =>
          ["cold-rolls", "fried-rolls", "baked-rolls"].includes(
            item.categoryId,
          ),
        )
        .map((item) => [item.slug, item.imageUrl]),
    );

    expect(rollImages).toEqual({
      "tender-roll": "/menu-generated/sushi/tender-roll-v2.jpg",
      "philadelphia-classic":
        "/menu-generated/sushi/philadelphia-classic-v2.jpg",
      "california-salmon": "/menu-generated/sushi/california-salmon-v2.jpg",
      "california-crab": "/menu-generated/sushi/california-crab-v2.jpg",
      alaska: "/menu-generated/sushi/alaska-v2.jpg",
      canada: "/menu-generated/sushi/canada-v2.jpg",
      "ebi-tempura": "/menu-generated/sushi/ebi-tempura-v2.jpg",
      "tuna-tempura": "/menu-generated/sushi/tuna-tempura-v2.jpg",
      "salmon-tempura": "/menu-generated/sushi/salmon-tempura-v2.jpg",
      "caesar-tempura": "/menu-generated/sushi/caesar-tempura-v2.jpg",
      "crab-tempura": "/menu-generated/sushi/crab-tempura-v2.jpg",
      "kyoto-tempura": "/menu-generated/sushi/kyoto-tempura-v2.jpg",
      "salmon-hot": "/menu-generated/sushi/salmon-hot-v2.jpg",
      "hot-mix": "/menu-generated/sushi/hot-mix-v2.jpg",
      "ebi-hot": "/menu-generated/sushi/ebi-hot-v2.jpg",
      "chicken-cheese-hot": "/menu-generated/sushi/chicken-cheese-hot-v2.jpg",
      "geisha-kiss": "/menu-generated/sushi/geisha-kiss-v2.jpg",
      "california-hot": "/menu-generated/sushi/california-hot-v2.jpg",
    });
  });

  it("includes artwork for the requested menu positions", () => {
    const slugs = [
      "beef-ramen",
      "cheese-ramen",
      "caesar-salmon",
      "caesar-shrimp",
      "shrimp-cream-pasta",
      "ribeye",
      "pizza-chicken-mushrooms",
      "margherita",
      "pizza-kazy",
      "mashed-potato-side",
      "rice-side",
      "potato-wedges-side",
      "lula-kebab",
      "duck-shashlik",
      "leg-shashlik",
      "wings-shashlik",
      "entrecote-shashlik",
      "lamb-shashlik",
      "tashkent-plov-company",
      "mini-samsa-four",
      "mini-chebureki-five",
    ];
    const itemsBySlug = new Map(menuItems.map((item) => [item.slug, item]));

    for (const slug of slugs) {
      expect(itemsBySlug.get(slug)?.imageUrl, slug).toBeTruthy();
    }
  });

  it("uses the correct eastern dish artwork", () => {
    const imagesBySlug = Object.fromEntries(
      menuItems.map((item) => [item.slug, item.imageUrl]),
    );

    expect(imagesBySlug["fried-lagman"]).toBe(
      "/menu-normalized/page-27-image-14.webp",
    );
    expect(imagesBySlug["tashkent-plov"]).toBe(
      "/menu-normalized/page-27-image-15.webp",
    );
    expect(imagesBySlug["tashkent-plov-company"]).toBe(
      "/menu-normalized/page-27-image-15.webp",
    );
  });

  it("uses the correct shakshuka and frittata artwork", () => {
    const imagesBySlug = Object.fromEntries(
      menuItems.map((item) => [item.slug, item.imageUrl]),
    );

    expect(imagesBySlug["vegetable-frittata"]).toBe(
      "/menu-normalized/page-03-image-01.webp",
    );
    expect(imagesBySlug["shakshuka-cheese"]).toBe(
      "/menu-normalized/page-03-image-13.webp",
    );
    expect(imagesBySlug["white-shakshuka"]).toBe(
      "/menu-normalized/page-03-image-14.webp",
    );
  });

  it("serves normalized artwork for every PDF dish photo", () => {
    expect(
      menuItems.filter((item) => item.imageUrl?.startsWith("/menu-assets/")),
    ).toHaveLength(0);
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

import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return ["", "/menu", "/about", "/dine-in"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/menu" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/menu" ? 0.9 : 0.7,
  }));
}

import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return ["", "/menu", "/about", "/dine-in"].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/menu" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/menu" ? 0.9 : 0.7,
  }));
}

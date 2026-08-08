const localFallback = "http://localhost:3000";

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return localFallback;

  try {
    const url = new URL(configured);
    if (!["http:", "https:"].includes(url.protocol)) return localFallback;
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return localFallback;
  }
}

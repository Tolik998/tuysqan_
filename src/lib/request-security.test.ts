import { describe, expect, it } from "vitest";
import {
  clientIp,
  consumeRateLimit,
  exceedsBodyLimit,
  isTrustedMutation,
  noStoreHeaders,
} from "@/lib/request-security";

function request(headers: HeadersInit = {}) {
  return new Request("https://tuysqan.example/api/orders", { headers });
}

describe("request security", () => {
  it("allows same-origin and rejects cross-origin mutations", () => {
    expect(
      isTrustedMutation(
        request({
          origin: "https://tuysqan.example",
          "sec-fetch-site": "same-origin",
        }),
      ),
    ).toBe(true);
    expect(
      isTrustedMutation(
        request({
          origin: "https://attacker.example",
          "sec-fetch-site": "cross-site",
        }),
      ),
    ).toBe(false);
  });

  it("detects oversized declared bodies", () => {
    expect(exceedsBodyLimit(request({ "content-length": "101" }), 100)).toBe(
      true,
    );
    expect(exceedsBodyLimit(request({ "content-length": "100" }), 100)).toBe(
      false,
    );
  });

  it("extracts only the first forwarded IP", () => {
    expect(
      clientIp(request({ "x-forwarded-for": "203.0.113.1, 10.0.0.1" })),
    ).toBe("203.0.113.1");
  });

  it("enforces a request limit", () => {
    const key = `test-${crypto.randomUUID()}`;
    expect(consumeRateLimit(key, 1, 60_000).allowed).toBe(true);
    expect(consumeRateLimit(key, 1, 60_000).allowed).toBe(false);
  });

  it("returns non-cacheable response headers", () => {
    const headers = noStoreHeaders({ "Retry-After": "10" });
    expect(headers.get("cache-control")).toContain("no-store");
    expect(headers.get("retry-after")).toBe("10");
  });
});

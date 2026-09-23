import { describe, expect, it } from "vitest";
import { formatDate, formatTons, pct } from "../lib/format";

describe("format helpers", () => {
  it("formats tons with Brazilian decimal separators", () => {
    expect(formatTons(1234.5)).toBe("1.234,500");
    expect(formatTons({ toString: () => "12.3456" })).toBe("12,346");
  });

  it("formats percentages consistently", () => {
    expect(pct(7.25)).toBe("7,3%");
  });

  it("returns a dash for empty dates", () => {
    expect(formatDate(null)).toBe("-");
  });
});

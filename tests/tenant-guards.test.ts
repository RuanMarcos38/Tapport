import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("tenant isolation guardrails", () => {
  it("loads operation lists and dashboards through company-scoped queries", () => {
    const queries = source("services/queries.ts");
    expect(queries).toContain("where: { companyId, deletedAt: null }");
    expect(queries).toContain("where: { id, companyId, deletedAt: null }");
  });

  it("validates operation mutations against the authenticated company", () => {
    const operations = source("app/actions/operations.ts");
    expect(operations).toContain("companyId: session.companyId");
    expect(operations).toContain("where: { id: operationId, companyId: session.companyId");
  });

  it("does not expose secret values in the committed env template", () => {
    const envTemplate = source(".env.example");
    expect(envTemplate).toContain("DATABASE_URL=");
    expect(envTemplate).toContain("AUTH_SECRET=");
    expect(envTemplate).not.toMatch(/service_role|sk_live|sk_test|eyJ/i);
  });
});

import { describe, expect, it } from "vitest";
import { can, roleLabels } from "../lib/rbac";

describe("RBAC", () => {
  it("grants full access to super admins and company admins", () => {
    expect(can("SUPER_ADMIN", "users", "delete")).toBe(true);
    expect(can("COMPANY_ADMIN", "master-data", "administer")).toBe(true);
  });

  it("limits viewers to read-oriented modules", () => {
    expect(can("VIEWER", "dashboard", "view")).toBe(true);
    expect(can("VIEWER", "operations", "edit")).toBe(false);
    expect(can("VIEWER", "users", "view")).toBe(false);
  });

  it("keeps operator access focused on execution screens", () => {
    expect(can("OPERATOR", "discharge", "create")).toBe(true);
    expect(can("OPERATOR", "scale", "create")).toBe(true);
    expect(can("OPERATOR", "users", "delete")).toBe(false);
  });

  it("has labels for every supported role", () => {
    expect(Object.keys(roleLabels).sort()).toEqual(
      ["COMPANY_ADMIN", "MANAGER", "OPERATOR", "SUPER_ADMIN", "VIEWER"].sort()
    );
  });
});

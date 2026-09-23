import { RoleKey } from "@prisma/client";

export const roleLabels: Record<RoleKey, string> = {
  SUPER_ADMIN: "Super Admin",
  COMPANY_ADMIN: "Administrador",
  MANAGER: "Gerente",
  OPERATOR: "Operador",
  VIEWER: "Visualizador"
};

const grants: Record<RoleKey, string[]> = {
  SUPER_ADMIN: ["*:*"],
  COMPANY_ADMIN: ["*:*"],
  MANAGER: [
    "dashboard:view",
    "operations:view",
    "operations:create",
    "operations:edit",
    "operations:export",
    "master-data:view",
    "master-data:create",
    "master-data:edit",
    "reports:view",
    "reports:export",
    "users:view"
  ],
  OPERATOR: [
    "dashboard:view",
    "operations:view",
    "discharge:view",
    "discharge:create",
    "discharge:edit",
    "scale:view",
    "scale:create"
  ],
  VIEWER: ["dashboard:view", "operations:view", "reports:view"]
};

export function can(role: RoleKey, module: string, action: string) {
  const permissions = grants[role] ?? [];
  return (
    permissions.includes("*:*") ||
    permissions.includes(`${module}:*`) ||
    permissions.includes(`${module}:${action}`)
  );
}


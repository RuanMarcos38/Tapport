import { PrismaClient, MasterDataType, OperationStatus, RoleKey } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

const modules = [
  "dashboard",
  "operations",
  "master-data",
  "users",
  "reports",
  "discharge",
  "scale",
  "super-admin"
];
const actions = ["view", "create", "edit", "delete", "export", "admin"];

const masterData: Record<MasterDataType, Array<[string, string]>> = {
  CLIENT: [
    ["AGRIBRASIL", "AGRIBRASIL"],
    ["BUNGE", "BUNGE"],
    ["CARGILL AGR S/A", "CARGILL-AGR-S-A"],
    ["INTERFERTIL", "INTERFERTIL"],
    ["NOVAFERTIL", "NOVAFERTIL"],
    ["NATRIO", "NATRIO"],
    ["ZPORT", "ZPORT"]
  ],
  PRODUCT: [
    ["Big Bag - Fert Mineral", "BIG-BAG-FERT-MINERAL"],
    ["Soda Ash", "SODA-ASH"],
    ["KCL", "KCL"],
    ["MAP", "MAP"],
    ["MOP", "MOP"]
  ],
  WAREHOUSE: [
    ["INTERFERTIL", "AZ INTERFERTIL"],
    ["NOVAFERTIL", "AZ ZPORT1"],
    ["DIRETO", "DIRETO"],
    ["Extracargo I", "EXTRACARGO-I"]
  ],
  DESTINATION: [
    ["SFS", "SFS"],
    ["DIRETO", "DIRETO"],
    ["Rio Verde", "RIO-VERDE"]
  ],
  CARRIER: [
    ["FROTA DEMO", "FROTA-DEMO"],
    ["DIRETO", "DIRETO"],
    ["PROPRIO", "PROPRIO"]
  ],
  HOLD: [
    ["Porão - 01", "P01"],
    ["Porão - 02", "P02"],
    ["Porão - 03", "P03"],
    ["Porão - 04", "P04"],
    ["Porão - 05", "P05"],
    ["Porão - 06", "P06"],
    ["Porão - 07", "P07"],
    ["Porão - 08", "P08"],
    ["Porão - 09", "P09"],
    ["Porão - 10", "P10"]
  ],
  SHIFT: [
    ["Manhã", "MANHA"],
    ["Tarde", "TARDE"],
    ["Noite", "NOITE"],
    ["Madrugada", "MADRUGADA"]
  ],
  STATUS: [
    ["CARGA SEGREGADA", "CARGA-SEGREGADA"],
    ["FINAL DE PORÃO", "FINAL-DE-PORAO"],
    ["RATEIO", "RATEIO"],
    ["VARREDURA", "VARREDURA"]
  ],
  BERTH: [
    ["101", "101"],
    ["102", "102"],
    ["103", "103"],
    ["201", "201"],
    ["Berço 102", "BERCO-102"]
  ],
  PLATE: [
    ["AUS5A68", "AUS5A68"],
    ["MIC7E96 / MLJ0G33", "MIC7E96-MLJ0G33"],
    ["QIN0B94", "QIN0B94"],
    ["TST1A23 / CAR4B56", "TST1A23-CAR4B56"]
  ]
};

async function seedRoles() {
  const roleData = [
    [RoleKey.SUPER_ADMIN, "Super Admin"],
    [RoleKey.COMPANY_ADMIN, "Administrador"],
    [RoleKey.MANAGER, "Gerente"],
    [RoleKey.OPERATOR, "Operador"],
    [RoleKey.VIEWER, "Visualizador"]
  ] as const;

  for (const [key, name] of roleData) {
    await prisma.role.upsert({
      where: { key },
      update: { name },
      create: { key, name }
    });
  }

  for (const module of modules) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { module_action: { module, action } },
        update: {},
        create: { module, action, description: `${module}:${action}` }
      });
    }
  }

  const allPermissions = await prisma.permission.findMany();
  const roleMap = Object.fromEntries((await prisma.role.findMany()).map((role) => [role.key, role]));
  const byPermission = new Map(allPermissions.map((permission) => [`${permission.module}:${permission.action}`, permission]));

  const roleGrants: Record<RoleKey, string[]> = {
    SUPER_ADMIN: allPermissions.map((permission) => `${permission.module}:${permission.action}`),
    COMPANY_ADMIN: allPermissions.filter((permission) => permission.module !== "super-admin").map((permission) => `${permission.module}:${permission.action}`),
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
      "users:view",
      "discharge:view",
      "discharge:create",
      "discharge:edit"
    ],
    OPERATOR: ["dashboard:view", "operations:view", "discharge:view", "discharge:create", "scale:view", "scale:create"],
    VIEWER: ["dashboard:view", "operations:view", "reports:view"]
  };

  for (const [roleKey, grants] of Object.entries(roleGrants) as Array<[RoleKey, string[]]>) {
    const role = roleMap[roleKey];
    for (const grant of grants) {
      const permission = byPermission.get(grant);
      if (!permission) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id }
      });
    }
  }
}

async function seedCompany() {
  const company = await prisma.company.upsert({
    where: { slug: "atlantico" },
    update: { name: "Atlântico Terminal", status: "ACTIVE" },
    create: {
      name: "Atlântico Terminal",
      slug: "atlantico",
      status: "ACTIVE",
      plan: "pro",
      userLimit: 50,
      operationLimit: 200
    }
  });

  for (const [type, entries] of Object.entries(masterData) as Array<[MasterDataType, Array<[string, string]>]>) {
    for (const [name, code] of entries) {
      await prisma.masterDataItem.upsert({
        where: { companyId_type_code: { companyId: company.id, type, code } },
        update: { name, active: true },
        create: { companyId: company.id, type, name, code, active: true }
      });
    }
  }

  return company;
}

async function seedUsers(companyId: string) {
  const passwordHash = await hashPassword("demo123");
  const users = [
    ["Admin Atlântico", "admin@atlantico.demo", RoleKey.COMPANY_ADMIN],
    ["Gerente Atlântico", "gerente@atlantico.demo", RoleKey.MANAGER],
    ["Operador Balança", "operador@atlantico.demo", RoleKey.OPERATOR],
    ["Cliente Visualizador", "cliente@atlantico.demo", RoleKey.VIEWER],
    ["Super Admin Tapport", "super@tapport.demo", RoleKey.SUPER_ADMIN]
  ] as const;

  for (const [name, email, roleKey] of users) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash },
      create: { name, email, passwordHash, lastLoginAt: new Date("2026-09-22T12:00:00Z") }
    });
    const role = await prisma.role.findUniqueOrThrow({ where: { key: roleKey } });
    await prisma.companyUser.upsert({
      where: { companyId_userId: { companyId, userId: user.id } },
      update: { roleId: role.id, active: true },
      create: { companyId, userId: user.id, roleId: role.id, active: true }
    });
  }
}

async function seedOperations(companyId: string) {
  const horizon = await prisma.operation.upsert({
    where: { companyId_code: { companyId, code: "OP-HORIZON-0001" } },
    update: {},
    create: {
      companyId,
      code: "OP-HORIZON-0001",
      vesselName: "MV HORIZON",
      berth: "Berço 102",
      importer: "Importador Demo",
      productSummary: "Soda Ash",
      status: OperationStatus.ACTIVE,
      startedAt: new Date("2026-09-21T10:00:00Z"),
      berthedAt: new Date("2026-09-21T09:00:00Z")
    }
  });

  const hold1 = await prisma.operationHold.upsert({
    where: { operationId_code: { operationId: horizon.id, code: "P01" } },
    update: { plannedTons: "5000.000" },
    create: { operationId: horizon.id, name: "Porão - 01", code: "P01", plannedTons: "5000.000" }
  });
  const hold2 = await prisma.operationHold.upsert({
    where: { operationId_code: { operationId: horizon.id, code: "P02" } },
    update: { plannedTons: "4000.000" },
    create: { operationId: horizon.id, name: "Porão - 02", code: "P02", plannedTons: "4000.000" }
  });

  const item1 = await prisma.planningItem.upsert({
    where: { operationId_sequence: { operationId: horizon.id, sequence: 1 } },
    update: {},
    create: {
      companyId,
      operationId: horizon.id,
      sequence: 1,
      di: "D.I 26/HORIZON-1 AZ INTERFERTIL",
      client: "INTERFERTIL",
      product: "Soda Ash",
      quantityTons: "5000.000",
      warehouse: "INTERFERTIL",
      destination: "SFS",
      carrier: "FROTA DEMO"
    }
  });
  const item2 = await prisma.planningItem.upsert({
    where: { operationId_sequence: { operationId: horizon.id, sequence: 2 } },
    update: {},
    create: {
      companyId,
      operationId: horizon.id,
      sequence: 2,
      di: "D.I 26/HORIZON-2 AZ ZPORT1",
      client: "NOVAFERTIL",
      product: "Soda Ash",
      quantityTons: "4000.000",
      warehouse: "NOVAFERTIL",
      destination: "SFS",
      carrier: "FROTA DEMO"
    }
  });

  await prisma.planningItemHold.upsert({
    where: { planningItemId_holdId: { planningItemId: item1.id, holdId: hold1.id } },
    update: { tons: "5000.000" },
    create: { planningItemId: item1.id, holdId: hold1.id, tons: "5000.000" }
  });
  await prisma.planningItemHold.upsert({
    where: { planningItemId_holdId: { planningItemId: item2.id, holdId: hold2.id } },
    update: { tons: "4000.000" },
    create: { planningItemId: item2.id, holdId: hold2.id, tons: "4000.000" }
  });

  const records = [
    [item1.id, hold1.id, "2026-09-21T10:10:00Z", "Manhã", "31.200", "TST1A23 / CAR4B56", "TK-E2E-1790015528458"],
    [item1.id, hold1.id, "2026-09-21T11:20:00Z", "Manhã", "32.400", "QIN0B94", "TK-HORIZON-001"],
    [item1.id, hold1.id, "2026-09-21T20:45:00Z", "Noite", "31.200", "MIC7E96 / MLJ0G33", "TK-HORIZON-MANUAL-01"],
    [item2.id, hold2.id, "2026-09-21T12:05:00Z", "Manhã", "28.100", "AUS5A68", "TK-HORIZON-002"]
  ] as const;

  for (const [planningItemId, holdId, date, shift, netWeightTons, plate, ticket] of records) {
    await prisma.dischargeRecord.upsert({
      where: { operationId_ticket: { operationId: horizon.id, ticket } },
      update: {},
      create: {
        companyId,
        operationId: horizon.id,
        planningItemId,
        holdId,
        date: new Date(date),
        shift,
        netWeightTons,
        plate,
        ticket
      }
    });
  }

  const otherOps = [
    ["OP-2026-0002", "MV OCEANIC", "Berço 201", "Big Bag - Fert Mineral", "28000.000"],
    ["OP-2026-0003", "MV PACIFIC", "Berço 103", "Big Bag - Fert Mineral", "42000.000"]
  ] as const;

  for (const [code, vesselName, berth, productSummary, planned] of otherOps) {
    const operation = await prisma.operation.upsert({
      where: { companyId_code: { companyId, code } },
      update: {},
      create: {
        companyId,
        code,
        vesselName,
        berth,
        importer: "Importador Demo",
        productSummary,
        status: OperationStatus.PLANNING,
        startedAt: code.endsWith("0002") ? new Date("2026-08-30T10:00:00Z") : new Date("2026-08-17T10:00:00Z")
      }
    });
    await prisma.operationHold.upsert({
      where: { operationId_code: { operationId: operation.id, code: "P01" } },
      update: { plannedTons: planned },
      create: { operationId: operation.id, name: "Porão - 01", code: "P01", plannedTons: planned }
    });
  }
}

async function main() {
  await seedRoles();
  const company = await seedCompany();
  await seedUsers(company.id);
  await seedOperations(company.id);
  await prisma.auditLog.create({
    data: {
      companyId: company.id,
      action: "seed.demo",
      entity: "system",
      after: { message: "Tapport demo data seeded" }
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import { CompanyStatus, MasterDataType, PrismaClient, RoleKey } from "@prisma/client";
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

const defaultMasterData: Record<MasterDataType, Array<[string, string]>> = {
  CLIENT: [],
  PRODUCT: [
    ["Carga geral", "CARGA-GERAL"],
    ["Granel sólido", "GRANEL-SOLIDO"],
    ["Fertilizante", "FERTILIZANTE"]
  ],
  WAREHOUSE: [
    ["Armazém principal", "ARMAZEM-PRINCIPAL"],
    ["Direto", "DIRETO"]
  ],
  DESTINATION: [["Direto", "DIRETO"]],
  CARRIER: [["Próprio", "PROPRIO"]],
  HOLD: [
    ["Porão - 01", "P01"],
    ["Porão - 02", "P02"],
    ["Porão - 03", "P03"],
    ["Porão - 04", "P04"],
    ["Porão - 05", "P05"]
  ],
  SHIFT: [
    ["Manhã", "MANHA"],
    ["Tarde", "TARDE"],
    ["Noite", "NOITE"],
    ["Madrugada", "MADRUGADA"]
  ],
  STATUS: [
    ["Em planejamento", "EM-PLANEJAMENTO"],
    ["Em operação", "EM-OPERACAO"],
    ["Final de porão", "FINAL-DE-PORAO"],
    ["Concluído", "CONCLUIDO"]
  ],
  BERTH: [
    ["101", "101"],
    ["102", "102"],
    ["103", "103"],
    ["201", "201"]
  ],
  PLATE: []
};

function optionalEnv(key: string) {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

function requireBootstrapEnv(key: string) {
  const value = optionalEnv(key);
  if (!value) {
    throw new Error(`Variável obrigatória ausente: ${key}`);
  }
  return value;
}

async function seedRoles() {
  const roleData = [
    [RoleKey.SUPER_ADMIN, "Super Admin"],
    [RoleKey.COMPANY_ADMIN, "Administrador"],
    [RoleKey.MANAGER, "Gestor"],
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
  const roles = new Map((await prisma.role.findMany()).map((role) => [role.key, role]));
  const permissions = new Map(allPermissions.map((permission) => [`${permission.module}:${permission.action}`, permission]));

  const roleGrants: Record<RoleKey, string[]> = {
    SUPER_ADMIN: allPermissions.map((permission) => `${permission.module}:${permission.action}`),
    COMPANY_ADMIN: allPermissions
      .filter((permission) => permission.module !== "super-admin")
      .map((permission) => `${permission.module}:${permission.action}`),
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
    const role = roles.get(roleKey);
    if (!role) {
      throw new Error(`Perfil não encontrado: ${roleKey}`);
    }

    for (const grant of grants) {
      const permission = permissions.get(grant);
      if (!permission) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id }
      });
    }
  }
}

async function seedDefaultMasterData(companyId: string) {
  for (const [type, entries] of Object.entries(defaultMasterData) as Array<[MasterDataType, Array<[string, string]>]>) {
    for (const [name, code] of entries) {
      await prisma.masterDataItem.upsert({
        where: { companyId_type_code: { companyId, type, code } },
        update: { name, active: true },
        create: { companyId, type, name, code, active: true }
      });
    }
  }
}

async function upsertCompanyUser(companyId: string, roleKey: RoleKey, name: string, email: string, password: string) {
  if (password.length < 12) {
    throw new Error(`A senha inicial de ${email} precisa ter pelo menos 12 caracteres.`);
  }

  const role = await prisma.role.findUniqueOrThrow({ where: { key: roleKey } });
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, deletedAt: null },
    create: { name, email, passwordHash }
  });

  await prisma.companyUser.upsert({
    where: { companyId_userId: { companyId, userId: user.id } },
    update: { roleId: role.id, active: true },
    create: { companyId, userId: user.id, roleId: role.id, active: true }
  });

  return user;
}

async function bootstrapInitialTenant() {
  const hasTenantBootstrap = [
    "BOOTSTRAP_COMPANY_NAME",
    "BOOTSTRAP_COMPANY_SLUG",
    "BOOTSTRAP_ADMIN_NAME",
    "BOOTSTRAP_ADMIN_EMAIL",
    "BOOTSTRAP_ADMIN_PASSWORD"
  ].some((key) => optionalEnv(key));

  if (!hasTenantBootstrap) {
    console.log("RBAC inicial aplicado. Nenhuma empresa foi criada porque as variáveis BOOTSTRAP_* não foram definidas.");
    return;
  }

  const companyName = requireBootstrapEnv("BOOTSTRAP_COMPANY_NAME");
  const companySlug = requireBootstrapEnv("BOOTSTRAP_COMPANY_SLUG").toLowerCase();
  const adminName = requireBootstrapEnv("BOOTSTRAP_ADMIN_NAME");
  const adminEmail = requireBootstrapEnv("BOOTSTRAP_ADMIN_EMAIL").toLowerCase();
  const adminPassword = requireBootstrapEnv("BOOTSTRAP_ADMIN_PASSWORD");

  const company = await prisma.company.upsert({
    where: { slug: companySlug },
    update: {
      name: companyName,
      status: CompanyStatus.ACTIVE,
      deletedAt: null
    },
    create: {
      name: companyName,
      slug: companySlug,
      status: CompanyStatus.ACTIVE,
      plan: optionalEnv("BOOTSTRAP_COMPANY_PLAN") ?? "production",
      userLimit: Number(optionalEnv("BOOTSTRAP_USER_LIMIT") ?? 25),
      operationLimit: Number(optionalEnv("BOOTSTRAP_OPERATION_LIMIT") ?? 50)
    }
  });

  const admin = await upsertCompanyUser(company.id, RoleKey.COMPANY_ADMIN, adminName, adminEmail, adminPassword);

  const superAdminEmail = optionalEnv("BOOTSTRAP_SUPER_ADMIN_EMAIL")?.toLowerCase();
  const superAdminPassword = optionalEnv("BOOTSTRAP_SUPER_ADMIN_PASSWORD");
  if (superAdminEmail || superAdminPassword) {
    if (!superAdminEmail || !superAdminPassword) {
      throw new Error("Defina BOOTSTRAP_SUPER_ADMIN_EMAIL e BOOTSTRAP_SUPER_ADMIN_PASSWORD juntos.");
    }
    await upsertCompanyUser(
      company.id,
      RoleKey.SUPER_ADMIN,
      optionalEnv("BOOTSTRAP_SUPER_ADMIN_NAME") ?? "Super Admin",
      superAdminEmail,
      superAdminPassword
    );
  }

  if (optionalEnv("BOOTSTRAP_DEFAULT_MASTER_DATA") === "true") {
    await seedDefaultMasterData(company.id);
  }

  await prisma.auditLog.create({
    data: {
      companyId: company.id,
      actorId: admin.id,
      action: "bootstrap.production",
      entity: "system",
      after: { companySlug, adminEmail }
    }
  });

  console.log(`Tenant de produção configurado: ${companySlug}`);
}

async function main() {
  await seedRoles();
  await bootstrapInitialTenant();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

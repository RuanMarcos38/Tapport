import { MasterDataType, OperationStatus, Prisma, RoleKey } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getCurrentMembership(userId: string, companyId: string) {
  return prisma.companyUser.findFirst({
    where: { userId, companyId, active: true },
    include: { company: true, role: true, user: true }
  });
}

export async function getDashboardData(companyId: string) {
  const operations = await prisma.operation.findMany({
    where: { companyId, deletedAt: null },
    include: {
      holds: true,
      planningItems: true,
      dischargeRecords: {
        where: { deletedAt: null },
        include: { hold: true, planningItem: true },
        orderBy: { date: "desc" }
      }
    },
    orderBy: [{ status: "asc" }, { startedAt: "desc" }]
  });

  const activeOperations = operations.filter((operation) => operation.status !== "COMPLETED");
  const totalPlanned = operations.reduce((sum, operation) => sum + plannedTons(operation), 0);
  const totalUnloaded = operations.reduce((sum, operation) => sum + unloadedTons(operation), 0);
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const recordsToday = operations.flatMap((operation) =>
    operation.dischargeRecords.filter((record) => record.date >= startOfDay)
  );
  const highlight = activeOperations.find((operation) => operation.dischargeRecords.length > 0) ?? activeOperations[0];

  return {
    operations,
    activeOperations,
    highlight,
    totalPlanned,
    totalUnloaded,
    recordsToday,
    todayTons: recordsToday.reduce((sum, record) => sum + Number(record.netWeightTons), 0),
    weeks: buildPeriodSeries(8, "week", operations),
    months: buildPeriodSeries(6, "month", operations)
  };
}

export async function getOperations(companyId: string, params?: { q?: string; status?: string }) {
  return prisma.operation.findMany({
    where: {
      companyId,
      deletedAt: null,
      vesselName: params?.q ? { contains: params.q, mode: "insensitive" } : undefined,
      status: params?.status && params.status !== "all" ? (params.status as OperationStatus) : undefined
    },
    include: {
      planningItems: true,
      dischargeRecords: { where: { deletedAt: null } },
      holds: true
    },
    orderBy: [{ status: "asc" }, { startedAt: "desc" }]
  });
}

export async function getOperation(companyId: string, id: string) {
  return prisma.operation.findFirst({
    where: { id, companyId, deletedAt: null },
    include: {
      holds: { orderBy: { code: "asc" } },
      planningItems: {
        where: { deletedAt: null },
        include: { holds: { include: { hold: true } } },
        orderBy: { sequence: "asc" }
      },
      dischargeRecords: {
        where: { deletedAt: null },
        include: { hold: true, planningItem: true },
        orderBy: { date: "desc" }
      }
    }
  });
}

export async function getMasterData(companyId: string, type: MasterDataType, q?: string) {
  return prisma.masterDataItem.findMany({
    where: {
      companyId,
      type,
      deletedAt: null,
      name: q ? { contains: q, mode: "insensitive" } : undefined
    },
    orderBy: { name: "asc" }
  });
}

export async function getMasterCounts(companyId: string) {
  const grouped = await prisma.masterDataItem.groupBy({
    by: ["type"],
    where: { companyId, deletedAt: null },
    _count: true
  });
  return Object.fromEntries(grouped.map((item) => [item.type, item._count]));
}

export async function getCompanyUsers(companyId: string, q?: string) {
  return prisma.companyUser.findMany({
    where: {
      companyId,
      user: {
        deletedAt: null,
        OR: q
          ? [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } }
            ]
          : undefined
      }
    },
    include: { user: true, role: true },
    orderBy: { createdAt: "asc" }
  });
}

export async function getRoles() {
  return prisma.role.findMany({ orderBy: { name: "asc" } });
}

export async function getSuperAdminMetrics() {
  const [companies, users, operations, logs] = await Promise.all([
    prisma.company.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.operation.count({ where: { deletedAt: null } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 25, include: { company: true, actor: true } })
  ]);
  return { companies, users, operations, logs };
}

export function plannedTons(operation: { planningItems: Array<{ quantityTons: Prisma.Decimal | number | string }> }) {
  return operation.planningItems.reduce((sum, item) => sum + Number(item.quantityTons), 0);
}

export function unloadedTons(operation: { dischargeRecords: Array<{ netWeightTons: Prisma.Decimal | number | string }> }) {
  return operation.dischargeRecords.reduce((sum, item) => sum + Number(item.netWeightTons), 0);
}

export function operationProgress(operation: {
  planningItems: Array<{ quantityTons: Prisma.Decimal | number | string }>;
  dischargeRecords: Array<{ netWeightTons: Prisma.Decimal | number | string }>;
}) {
  const planned = plannedTons(operation);
  if (!planned) return 0;
  return (unloadedTons(operation) / planned) * 100;
}

export function canAccessAdmin(role: RoleKey) {
  return role === "SUPER_ADMIN";
}

function buildPeriodSeries(count: number, unit: "week" | "month", operations: Awaited<ReturnType<typeof getOperations>>) {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now);
    if (unit === "week") date.setDate(now.getDate() - (count - index - 1) * 7);
    if (unit === "month") date.setMonth(now.getMonth() - (count - index - 1));
    const start = unit === "week" ? startOfWeek(date) : new Date(date.getFullYear(), date.getMonth(), 1);
    const end = unit === "week" ? new Date(start.getTime() + 7 * 86400000) : new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const records = operations.flatMap((operation) =>
      operation.dischargeRecords.filter((record) => record.date >= start && record.date < end)
    );
    return {
      label:
        unit === "week"
          ? `${start.getDate().toString().padStart(2, "0")}/${(start.getMonth() + 1).toString().padStart(2, "0")}`
          : start.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
      tons: records.reduce((sum, record) => sum + Number(record.netWeightTons), 0),
      trucks: records.length
    };
  });
}

function startOfWeek(value: Date) {
  const date = new Date(value);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.getFullYear(), date.getMonth(), diff);
}


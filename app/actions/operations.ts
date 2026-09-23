"use server";

import { OperationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createOperationAction(formData: FormData) {
  const session = await requirePermission("operations", "create");
  const vesselName = String(formData.get("vesselName") ?? "").trim();
  const berth = String(formData.get("berth") ?? "").trim();
  const importer = String(formData.get("importer") ?? "").trim();
  const startedAt = String(formData.get("startedAt") ?? "");
  if (!vesselName || !berth || !startedAt) return;
  const count = await prisma.operation.count({ where: { companyId: session.companyId } });
  const operation = await prisma.operation.create({
    data: {
      companyId: session.companyId,
      code: `OP-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`,
      vesselName,
      berth,
      importer,
      productSummary: "A definir",
      status: OperationStatus.PLANNING,
      startedAt: new Date(`${startedAt}T00:00:00`)
    }
  });
  await prisma.auditLog.create({
    data: {
      companyId: session.companyId,
      actorId: session.userId,
      action: "operations.create",
      entity: "operation",
      recordId: operation.id,
      after: operation
    }
  });
  redirect(`/operations/${operation.id}/planning`);
}

export async function createPlanningItemAction(formData: FormData) {
  const session = await requirePermission("operations", "edit");
  const operationId = String(formData.get("operationId"));
  const operation = await prisma.operation.findFirstOrThrow({ where: { id: operationId, companyId: session.companyId } });
  const nextSequence = (await prisma.planningItem.count({ where: { operationId } })) + 1;
  const item = await prisma.planningItem.create({
    data: {
      companyId: session.companyId,
      operationId: operation.id,
      sequence: nextSequence,
      di: String(formData.get("di") ?? "").trim(),
      client: String(formData.get("client") ?? "").trim(),
      product: String(formData.get("product") ?? "").trim(),
      quantityTons: String(formData.get("quantityTons") ?? "0"),
      warehouse: String(formData.get("warehouse") ?? "").trim(),
      destination: String(formData.get("destination") ?? "").trim(),
      carrier: String(formData.get("carrier") ?? "").trim()
    }
  });
  await prisma.auditLog.create({
    data: {
      companyId: session.companyId,
      actorId: session.userId,
      action: "planning.create",
      entity: "planning_item",
      recordId: item.id,
      after: item
    }
  });
  revalidatePath(`/operations/${operationId}/planning`);
}

export async function createDischargeRecordAction(formData: FormData) {
  const session = await requirePermission("discharge", "create");
  const operationId = String(formData.get("operationId"));
  const sequence = Number(formData.get("sequence"));
  const holdId = String(formData.get("holdId"));
  const date = String(formData.get("date"));
  const shift = String(formData.get("shift") ?? "Manhã");
  const netWeightTons = String(formData.get("netWeightTons") ?? "0").replace(",", ".");
  const operation = await prisma.operation.findFirstOrThrow({
    where: { id: operationId, companyId: session.companyId, status: "ACTIVE" }
  });
  const planningItem = await prisma.planningItem.findFirstOrThrow({
    where: { operationId: operation.id, sequence }
  });
  const record = await prisma.dischargeRecord.create({
    data: {
      companyId: session.companyId,
      operationId: operation.id,
      planningItemId: planningItem.id,
      holdId,
      date: new Date(`${date}T12:00:00`),
      shift,
      netWeightTons,
      plate: String(formData.get("plate") ?? "").trim() || null,
      ticket: String(formData.get("ticket") ?? "").trim() || null,
      entryTime: String(formData.get("entryTime") ?? "").trim() || null,
      exitTime: String(formData.get("exitTime") ?? "").trim() || null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      isSweep: formData.get("isSweep") === "on",
      createdById: session.userId
    }
  });
  await prisma.auditLog.create({
    data: {
      companyId: session.companyId,
      actorId: session.userId,
      action: "discharge.create",
      entity: "discharge_record",
      recordId: record.id,
      after: record
    }
  });
  revalidatePath(`/operations/${operationId}/unloading`);
  revalidatePath(`/balanca/${operationId}`);
}

export async function recalculateOperationAction(formData: FormData) {
  const session = await requirePermission("operations", "edit");
  const operationId = String(formData.get("operationId"));
  await prisma.operation.updateMany({
    where: { id: operationId, companyId: session.companyId },
    data: { updatedAt: new Date() }
  });
  await prisma.auditLog.create({
    data: {
      companyId: session.companyId,
      actorId: session.userId,
      action: "operations.recalculate",
      entity: "operation",
      recordId: operationId
    }
  });
  revalidatePath(`/operations/${operationId}/planning`);
}


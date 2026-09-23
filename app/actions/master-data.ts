"use server";

import { MasterDataType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toUpperCase();
}

export async function createMasterDataAction(formData: FormData) {
  const session = await requirePermission("master-data", "create");
  const type = String(formData.get("type")) as MasterDataType;
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim() || slugify(name);
  if (!name) return;

  const item = await prisma.masterDataItem.create({
    data: { companyId: session.companyId, type, name, code }
  });
  await prisma.auditLog.create({
    data: {
      companyId: session.companyId,
      actorId: session.userId,
      action: "master-data.create",
      entity: "master_data_item",
      recordId: item.id,
      after: item
    }
  });
  revalidatePath("/master-data");
}

export async function updateMasterDataAction(formData: FormData) {
  const session = await requirePermission("master-data", "edit");
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim() || slugify(name);
  const before = await prisma.masterDataItem.findFirstOrThrow({
    where: { id, companyId: session.companyId }
  });
  const after = await prisma.masterDataItem.update({
    where: { id },
    data: { name, code }
  });
  await prisma.auditLog.create({
    data: {
      companyId: session.companyId,
      actorId: session.userId,
      action: "master-data.update",
      entity: "master_data_item",
      recordId: id,
      before,
      after
    }
  });
  revalidatePath("/master-data");
}

export async function deactivateMasterDataAction(formData: FormData) {
  const session = await requirePermission("master-data", "delete");
  const id = String(formData.get("id"));
  await prisma.masterDataItem.updateMany({
    where: { id, companyId: session.companyId },
    data: { active: false, deletedAt: new Date() }
  });
  await prisma.auditLog.create({
    data: {
      companyId: session.companyId,
      actorId: session.userId,
      action: "master-data.deactivate",
      entity: "master_data_item",
      recordId: id
    }
  });
  revalidatePath("/master-data");
}


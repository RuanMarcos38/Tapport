"use server";

import { RoleKey } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requirePermission, requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function createUserAction(formData: FormData) {
  const session = await requirePermission("users", "admin");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const roleKey = String(formData.get("role") ?? "OPERATOR") as RoleKey;
  const active = formData.get("active") === "on";
  if (!name || !email || password.length < 8) return;
  const role = await prisma.role.findUniqueOrThrow({ where: { key: roleKey } });
  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { name, email, passwordHash: await hashPassword(password) }
  });
  await prisma.companyUser.upsert({
    where: { companyId_userId: { companyId: session.companyId, userId: user.id } },
    update: { roleId: role.id, active },
    create: { companyId: session.companyId, userId: user.id, roleId: role.id, active }
  });
  await prisma.auditLog.create({
    data: {
      companyId: session.companyId,
      actorId: session.userId,
      action: "users.create",
      entity: "user",
      recordId: user.id,
      after: { name, email, roleKey, active }
    }
  });
  revalidatePath("/users");
}

export async function updateUserAction(formData: FormData) {
  const session = await requirePermission("users", "admin");
  const companyUserId = String(formData.get("companyUserId"));
  const name = String(formData.get("name") ?? "").trim();
  const roleKey = String(formData.get("role") ?? "VIEWER") as RoleKey;
  const active = formData.get("active") === "on";
  const membership = await prisma.companyUser.findFirstOrThrow({
    where: { id: companyUserId, companyId: session.companyId },
    include: { user: true }
  });
  const role = await prisma.role.findUniqueOrThrow({ where: { key: roleKey } });
  await prisma.user.update({ where: { id: membership.userId }, data: { name } });
  await prisma.companyUser.update({ where: { id: companyUserId }, data: { roleId: role.id, active } });
  await prisma.auditLog.create({
    data: {
      companyId: session.companyId,
      actorId: session.userId,
      action: "users.update",
      entity: "user",
      recordId: membership.userId,
      before: { name: membership.user.name },
      after: { name, roleKey, active }
    }
  });
  revalidatePath("/users");
}

export async function toggleUserAction(formData: FormData) {
  const session = await requirePermission("users", "admin");
  const companyUserId = String(formData.get("companyUserId"));
  const membership = await prisma.companyUser.findFirstOrThrow({
    where: { id: companyUserId, companyId: session.companyId }
  });
  await prisma.companyUser.update({ where: { id: companyUserId }, data: { active: !membership.active } });
  await prisma.auditLog.create({
    data: {
      companyId: session.companyId,
      actorId: session.userId,
      action: membership.active ? "users.deactivate" : "users.activate",
      entity: "company_user",
      recordId: companyUserId
    }
  });
  revalidatePath("/users");
}

export async function softDeleteUserAction(formData: FormData) {
  const session = await requirePermission("users", "delete");
  const companyUserId = String(formData.get("companyUserId"));
  const membership = await prisma.companyUser.findFirstOrThrow({
    where: { id: companyUserId, companyId: session.companyId }
  });
  await prisma.companyUser.update({ where: { id: companyUserId }, data: { active: false } });
  await prisma.user.update({ where: { id: membership.userId }, data: { deletedAt: new Date() } });
  await prisma.auditLog.create({
    data: {
      companyId: session.companyId,
      actorId: session.userId,
      action: "users.delete",
      entity: "user",
      recordId: membership.userId
    }
  });
  revalidatePath("/users");
}

export async function updateOwnNameAction(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await prisma.user.update({ where: { id: session.userId }, data: { name } });
  revalidatePath("/users");
}


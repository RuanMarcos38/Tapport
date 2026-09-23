"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, clearSession, requireSession } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/mailer";
import { hashPassword, verifyPassword } from "@/lib/password";

export async function loginAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug") ?? "").trim().toLowerCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const remember = formData.get("remember") === "on";
  const next = String(formData.get("next") ?? "/dashboard");

  const membership = await prisma.companyUser.findFirst({
    where: {
      active: true,
      company: { slug: tenantSlug, deletedAt: null },
      user: { email, deletedAt: null }
    },
    include: { user: true, company: true, role: true }
  });

  if (!membership || !(await verifyPassword(password, membership.user.passwordHash))) {
    redirect(`/login?error=invalid&tenant=${encodeURIComponent(tenantSlug)}&email=${encodeURIComponent(email)}`);
  }

  await prisma.user.update({
    where: { id: membership.userId },
    data: { lastLoginAt: new Date() }
  });

  await createSession(
    {
      userId: membership.userId,
      companyId: membership.companyId,
      companySlug: membership.company.slug,
      role: membership.role.key,
      name: membership.user.name,
      email: membership.user.email
    },
    remember
  );

  await prisma.auditLog.create({
    data: {
      companyId: membership.companyId,
      actorId: membership.userId,
      action: "auth.login",
      entity: "user",
      recordId: membership.userId
    }
  });

  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function requestPasswordResetAction(formData: FormData) {
  const tenantSlug = String(formData.get("tenantSlug") ?? "").trim().toLowerCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const membership = await prisma.companyUser.findFirst({
    where: { company: { slug: tenantSlug }, user: { email } },
    include: { company: true, user: true }
  });

  if (membership) {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    await prisma.passwordResetToken.create({
      data: {
        companyId: membership.companyId,
        userId: membership.userId,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 30)
      }
    });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const resetUrl = new URL(`/reset-password?token=${token}`, appUrl).toString();
    const emailResult = await sendPasswordResetEmail({
      to: membership.user.email,
      name: membership.user.name,
      companyName: membership.company.name,
      resetUrl
    });
    if (!emailResult.sent && process.env.NODE_ENV !== "production") {
      console.info(`Tapport reset URL for ${email}: ${resetUrl}`);
    }
  }

  redirect("/forgot-password?sent=1");
}

export async function resetPasswordAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8 || password !== confirm) redirect("/reset-password?error=invalid");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const reset = await prisma.passwordResetToken.findFirst({
    where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } }
  });
  if (!reset) redirect("/reset-password?error=expired");
  await prisma.user.update({
    where: { id: reset.userId },
    data: { passwordHash: await hashPassword(password) }
  });
  await prisma.passwordResetToken.update({
    where: { id: reset.id },
    data: { usedAt: new Date() }
  });
  redirect("/login?reset=1");
}

export async function updateProfileAction(formData: FormData) {
  const session = await requireSession();
  const name = String(formData.get("name") ?? "").trim();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
  const data: { name?: string; passwordHash?: string } = {};
  if (name) data.name = name;
  if (newPassword) {
    if (newPassword.length < 8 || newPassword !== confirmPassword) redirect("/perfil?error=password");
    if (!(await verifyPassword(currentPassword, user.passwordHash))) redirect("/perfil?error=current");
    data.passwordHash = await hashPassword(newPassword);
  }
  await prisma.user.update({ where: { id: session.userId }, data });
  await prisma.auditLog.create({
    data: {
      companyId: session.companyId,
      actorId: session.userId,
      action: "profile.update",
      entity: "user",
      recordId: session.userId,
      after: { name: data.name, passwordChanged: Boolean(data.passwordHash) }
    }
  });
  revalidatePath("/perfil");
  redirect("/perfil?saved=1");
}

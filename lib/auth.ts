import "server-only";

import crypto from "node:crypto";
import { RoleKey } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE = "tapport_session";

export type SessionPayload = {
  userId: string;
  companyId: string;
  companySlug: string;
  role: RoleKey;
  name: string;
  email: string;
  exp: number;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 24) {
    throw new Error("AUTH_SECRET must be configured with at least 24 characters.");
  }
  return value;
}

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function sign(payload: string) {
  return base64url(crypto.createHmac("sha256", secret()).update(payload).digest());
}

export function encodeSession(payload: SessionPayload) {
  const body = base64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function decodeSession(token?: string | null): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || sign(body) !== signature) return null;
  try {
    const normalized = body.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(Buffer.from(normalized, "base64").toString()) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function createSession(payload: Omit<SessionPayload, "exp">, remember = false) {
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12;
  const token = encodeSession({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + maxAge
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requirePermission(module: string, action: string) {
  const session = await requireSession();
  if (session.role === "SUPER_ADMIN") return session;
  const membership = await prisma.companyUser.findFirst({
    where: {
      userId: session.userId,
      companyId: session.companyId,
      active: true,
      role: {
        permissions: {
          some: {
            permission: { module, action }
          }
        }
      }
    }
  });
  if (!membership) redirect("/dashboard?forbidden=1");
  return session;
}


"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  Database,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Ship,
  Users,
  X
} from "lucide-react";
import { RoleKey } from "@prisma/client";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/cn";
import { roleLabels } from "@/lib/rbac";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/operations", label: "Operações", icon: Ship },
  { href: "/master-data", label: "Cadastros", icon: Database },
  { href: "/users", label: "Usuários", icon: Users }
];

const docs = [
  { href: "/onboarding", label: "Como Funciona", icon: BookOpen },
  { href: "/business-rules", label: "Regras de Negócio", icon: ClipboardList }
];

export function AppShell({
  children,
  user,
  role,
  email
}: {
  children: React.ReactNode;
  user: string;
  email: string;
  role: RoleKey;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const showAdmin = role === "SUPER_ADMIN";

  const sidebar = (
    <aside className="flex h-full w-64 flex-col bg-slate-950 text-slate-200">
      <div className="flex h-20 items-center gap-3 px-4">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-sky-500 font-bold text-white">T</div>
        <div>
          <div className="text-xl font-bold text-white">Tapport</div>
          <div className="text-xs text-slate-400">Gestão Portuária</div>
        </div>
        <button className="ml-auto rounded-md p-2 text-slate-400 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "border border-sky-400/25 bg-sky-400/15 text-white" : "text-slate-300 hover:bg-white/10 hover:text-white"
              )}
              onClick={() => setOpen(false)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        {showAdmin ? (
          <Link
            href="/super-admin"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname.startsWith("/super-admin")
                ? "border border-sky-400/25 bg-sky-400/15 text-white"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            )}
            onClick={() => setOpen(false)}
          >
            <ShieldCheck className="h-4 w-4" />
            Super Admin
          </Link>
        ) : null}
      </nav>

      <div className="px-3 pb-4">
        <div className="mb-2 px-3 text-xs font-semibold uppercase text-slate-500">Documentação</div>
        <div className="space-y-1">
          {docs.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                onClick={() => setOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className="mt-5 rounded-lg bg-white/5 p-3">
          <div className="text-xs font-semibold text-slate-400">{user}</div>
          <div className="truncate text-xs text-slate-500">{email}</div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="hidden fixed inset-y-0 left-0 z-40 lg:block">{sidebar}</div>
      {open ? <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden">{sidebar}</div> : null}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-md p-2 text-slate-600 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <div className="text-sm font-semibold text-slate-950">Tapport</div>
              <div className="text-xs text-slate-500">Gestão Portuária Online</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="hidden h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-slate-100 sm:grid" aria-label="Ativar modo escuro">
              <Moon className="h-4 w-4" />
            </button>
            <Link href="/perfil" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-100">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-sky-100 font-semibold text-sky-700">
                {user.slice(0, 1)}
              </div>
              <span className="hidden text-left sm:block">
                <span className="block font-medium text-slate-900">{user}</span>
                <span className="block text-xs text-slate-500">{roleLabels[role]}</span>
              </span>
            </Link>
            <form action={logoutAction}>
              <button className="grid h-9 w-9 place-items-center rounded-md text-slate-600 hover:bg-slate-100" aria-label="Sair">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1520px] px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <div className="text-xs font-semibold uppercase text-sky-700">{eyebrow}</div> : null}
        <h1 className="mt-1 text-3xl font-bold tracking-normal text-slate-950">{title}</h1>
        {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

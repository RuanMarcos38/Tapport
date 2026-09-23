import Link from "next/link";
import { createUserAction, softDeleteUserAction, toggleUserAction, updateUserAction } from "@/app/actions/users";
import { PageHeader } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { requireSession } from "@/lib/auth";
import { roleLabels } from "@/lib/rbac";
import { formatDate } from "@/lib/format";
import { getCompanyUsers, getRoles } from "@/services/queries";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; new?: string; edit?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const [memberships, roles] = await Promise.all([getCompanyUsers(session.companyId, params.q), getRoles()]);
  const admins = memberships.filter((membership) => membership.role.key === "COMPANY_ADMIN").length;
  const operators = memberships.filter((membership) => membership.role.key === "OPERATOR").length;
  const inactive = memberships.filter((membership) => !membership.active).length;

  return (
    <div>
      <PageHeader title="Usuários" description="Gestão de usuários e permissões" action={<Link href="/users?new=1" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Adicionar Usuário</Link>} />
      <div className="mb-5 grid gap-4 md:grid-cols-4">
        <StatCard label="Total Usuários" value={memberships.length} />
        <StatCard label="Administradores" value={admins} />
        <StatCard label="Operadores" value={operators} />
        <StatCard label="Inativos" value={inactive} />
      </div>
      {params.new ? (
        <form action={createUserAction} className="mb-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold">Adicionar Usuário</h2>
          <p className="text-sm text-slate-500">Novo acesso à operação deste tenant.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input name="name" placeholder="Nome completo" className="h-10 rounded-md border border-slate-200 px-3" />
            <input name="email" type="email" placeholder="email@empresa.com" className="h-10 rounded-md border border-slate-200 px-3" />
            <input name="password" type="password" placeholder="Senha" className="h-10 rounded-md border border-slate-200 px-3" />
            <select name="role" defaultValue="OPERATOR" className="h-10 rounded-md border border-slate-200 px-3">
              {roles.filter((role) => role.key !== "SUPER_ADMIN").map((role) => <option key={role.id} value={role.key}>{roleLabels[role.key]}</option>)}
            </select>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked />Ativo</label>
          <div className="mt-4 flex justify-end gap-3">
            <Link href="/users" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Cancelar</Link>
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Criar usuário</button>
          </div>
        </form>
      ) : null}
      <form className="mb-5">
        <input name="q" defaultValue={params.q ?? ""} placeholder="Buscar usuários..." className="h-10 w-80 rounded-md border border-slate-200 bg-white px-3 text-sm" />
      </form>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-soft tapport-scrollbar">
        <table className="min-w-[920px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>{["Nome", "E-mail", "Papel", "Último Login", "Status", "Ações"].map((header) => <th key={header} className="px-4 py-3">{header}</th>)}</tr>
          </thead>
          <tbody>
            {memberships.map((membership) => (
              <tr key={membership.id} className="border-t border-slate-100">
                {params.edit === membership.id ? (
                  <td colSpan={6} className="px-4 py-3">
                    <form action={updateUserAction} className="grid gap-3 md:grid-cols-[1fr_220px_120px_auto]">
                      <input type="hidden" name="companyUserId" value={membership.id} />
                      <input name="name" defaultValue={membership.user.name} className="h-10 rounded-md border border-slate-200 px-3" />
                      <select name="role" defaultValue={membership.role.key} className="h-10 rounded-md border border-slate-200 px-3">
                        {roles.filter((role) => role.key !== "SUPER_ADMIN").map((role) => <option key={role.id} value={role.key}>{roleLabels[role.key]}</option>)}
                      </select>
                      <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={membership.active} />Ativo</label>
                      <button className="rounded-md bg-slate-950 px-4 text-sm font-semibold text-white">Salvar</button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-3 font-semibold">{membership.user.name}</td>
                    <td className="px-4 py-3">{membership.user.email}</td>
                    <td className="px-4 py-3">{roleLabels[membership.role.key]}</td>
                    <td className="px-4 py-3">{formatDate(membership.user.lastLoginAt)}</td>
                    <td className="px-4 py-3">{membership.active ? "Ativo" : "Inativo"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/users?edit=${membership.id}`} className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold">Editar</Link>
                        <form action={toggleUserAction}><input type="hidden" name="companyUserId" value={membership.id} /><button className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold">{membership.active ? "Desativar" : "Ativar"}</button></form>
                        <form action={softDeleteUserAction}><input type="hidden" name="companyUserId" value={membership.id} /><button className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-700">Excluir</button></form>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-slate-100 p-3 text-sm text-slate-500">Showing {memberships.length} of {memberships.length} rows</div>
      </div>
    </div>
  );
}

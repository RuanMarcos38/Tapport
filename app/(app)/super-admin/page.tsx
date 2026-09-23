import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { requireSession } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { canAccessAdmin } from "@/services/queries";
import { getSuperAdminMetrics } from "@/services/queries";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const session = await requireSession();
  if (!canAccessAdmin(session.role)) redirect("/dashboard");
  const metrics = await getSuperAdminMetrics();
  return (
    <div>
      <PageHeader title="Super Admin" description="Administração geral do SaaS Tapport." />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Empresas" value={metrics.companies.length} />
        <StatCard label="Usuários" value={metrics.users} />
        <StatCard label="Operações" value={metrics.operations} />
        <StatCard label="Status" value="Operacional" tone="success" />
      </div>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold">Empresas</h2>
        <div className="mt-4 overflow-x-auto tapport-scrollbar">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="px-3 py-2">Empresa</th><th className="px-3 py-2">Slug</th><th className="px-3 py-2">Plano</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Limites</th></tr></thead>
            <tbody>{metrics.companies.map((company) => <tr key={company.id} className="border-t border-slate-100"><td className="px-3 py-2 font-semibold">{company.name}</td><td className="px-3 py-2">{company.slug}</td><td className="px-3 py-2">{company.plan}</td><td className="px-3 py-2">{company.status}</td><td className="px-3 py-2">{company.userLimit} usuários · {company.operationLimit} operações</td></tr>)}</tbody>
          </table>
        </div>
      </section>
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold">Logs recentes</h2>
        <div className="mt-4 space-y-3">
          {metrics.logs.map((log) => (
            <div key={log.id} className="rounded-lg border border-slate-100 p-3 text-sm">
              <div className="font-semibold">{log.action} · {log.entity}</div>
              <div className="text-slate-500">{log.company?.name ?? "Global"} · {formatDateTime(log.createdAt)}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


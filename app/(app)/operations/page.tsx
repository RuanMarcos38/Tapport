import Link from "next/link";
import { OperationStatus } from "@prisma/client";
import { PageHeader } from "@/components/layout/app-shell";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatTons, pct } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { getOperations, operationProgress, plannedTons, unloadedTons } from "@/services/queries";

export const dynamic = "force-dynamic";

export default async function OperationsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const operations = await getOperations(session.companyId, params);

  return (
    <div>
      <PageHeader
        title="Operações"
        description="Navios no pátio e histórico"
        action={<Link href="/operations/nova" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Abrir navio</Link>}
      />
      <form className="mb-5 flex flex-wrap gap-3">
        <input name="q" defaultValue={params.q ?? ""} placeholder="Buscar por navio..." className="h-10 w-64 rounded-md border border-slate-200 bg-white px-3 text-sm" />
        <select name="status" defaultValue={params.status ?? "all"} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm">
          <option value="all">Todos os status</option>
          {Object.values(OperationStatus).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <button className="rounded-md border border-slate-200 bg-white px-4 text-sm font-medium">Filtrar</button>
      </form>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-soft tapport-scrollbar">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              {["Navio", "Berço", "Início", "Status", "% Concluído", "Total Planejado (t)", "Total Descarregado (t)", "Saldo (t)"].map((header) => (
                <th key={header} className="px-4 py-3 font-semibold">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {operations.map((operation) => {
              const planned = plannedTons(operation);
              const unloaded = unloadedTons(operation);
              const progress = operationProgress(operation);
              return (
                <tr key={operation.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">
                    <Link href={`/operations/${operation.id}`}>{operation.vesselName}</Link>
                  </td>
                  <td className="px-4 py-3">{operation.berth}</td>
                  <td className="px-4 py-3">{formatDate(operation.startedAt)}</td>
                  <td className="px-4 py-3">{operation.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex min-w-28 items-center gap-2">
                      <Progress value={progress} />
                      <span>{pct(progress)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatTons(planned)}</td>
                  <td className="px-4 py-3">{formatTons(unloaded)}</td>
                  <td className="px-4 py-3">{formatTons(planned - unloaded)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>Showing {operations.length} of {operations.length} rows</span>
          <div className="flex items-center gap-2">
            <button className="rounded-md border border-slate-200 px-3 py-1" disabled>Previous</button>
            <span>Page 1 of 1</span>
            <button className="rounded-md border border-slate-200 px-3 py-1" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}


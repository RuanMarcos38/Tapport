import Link from "next/link";
import { PageHeader } from "@/components/layout/app-shell";
import { RhythmChart } from "@/components/charts/rhythm-chart";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { formatDateTime, formatTons, pct } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { getDashboardData, operationProgress, plannedTons, unloadedTons } from "@/services/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();
  const data = await getDashboardData(session.companyId);
  const highlight = data.highlight;
  const highlightPlanned = highlight ? plannedTons(highlight) : 0;
  const highlightUnloaded = highlight ? unloadedTons(highlight) : 0;
  const highlightProgress = highlight ? operationProgress(highlight) : 0;

  return (
    <div>
      <PageHeader
        eyebrow="Sala de operação"
        title="Dashboard"
        description={`São Francisco do Sul · ${new Intl.DateTimeFormat("pt-BR").format(new Date())}`}
        action={<Link href="/dashboard" className="text-sm text-slate-500 underline">Atualizar</Link>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Operações ativas" value={data.activeOperations.length} detail="operações no cadastro" />
        <StatCard label="Total descarregado" value={`${formatTons(data.totalUnloaded)} t`} detail={`de ${formatTons(data.totalPlanned)} t`} />
        <StatCard label="Registros hoje" value={data.recordsToday.length} detail={`${formatTons(data.todayTons)} t no dia`} />
        <StatCard label="Média t/hora" value="sem base" detail="Sem tempos de ciclo suficientes" />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {[
          ["Hoje", "desde 0h · America/São Paulo", data.todayTons, data.recordsToday.length],
          ["Semana", "segunda a agora", data.weeks.at(-1)?.tons ?? 0, data.weeks.at(-1)?.trucks ?? 0],
          ["Mês", "mês corrente", data.months.at(-1)?.tons ?? 0, data.months.at(-1)?.trucks ?? 0]
        ].map(([label, detail, tons, trucks]) => (
          <div key={String(label)} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
            <div className="mt-1 text-xs text-slate-400">{detail}</div>
            <div className="mt-4 text-2xl font-bold">{formatTons(Number(tons))} t</div>
            <div className="text-sm text-slate-500">{trucks} caminhões</div>
          </div>
        ))}
      </div>

      {highlight ? (
        <section className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
          <Link href={`/operations/${highlight.id}`} className="block p-5 hover:bg-slate-50">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase text-sky-700">Navio no cais · {data.activeOperations.length} operações</div>
                <h2 className="mt-2 text-3xl font-bold">{highlight.vesselName}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {highlight.code} · {highlight.berth} · {highlight.importer ?? "Importador"} · {highlight.productSummary}
                </p>
              </div>
              <div className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">{pct(highlightProgress)}</div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-4">
              <StatCard label="Planejado" value={`${formatTons(highlightPlanned)} t`} />
              <StatCard label="Descarregado" value={`${formatTons(highlightUnloaded)} t`} />
              <StatCard label="Saldo" value={`${formatTons(highlightPlanned - highlightUnloaded)} t`} />
              <StatCard label="Caminhões" value={highlight.dischargeRecords.length} />
            </div>
            <div className="mt-5">
              <Progress value={highlightProgress} />
              <div className="mt-3 text-sm text-slate-500">
                Último lançamento: {formatDateTime(highlight.dischargeRecords[0]?.date)}
              </div>
            </div>
          </Link>
        </section>
      ) : null}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-bold">Semanas</h2>
          <p className="text-sm text-slate-500">8 semanas · toneladas</p>
          <RhythmChart data={data.weeks} />
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="font-bold">Meses</h2>
          <p className="text-sm text-slate-500">6 meses · toneladas</p>
          <RhythmChart data={data.months} />
        </section>
      </div>

      <section className="mt-5 rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-bold">Ainda no plano</h2>
          <p className="text-sm text-slate-500">{data.operations.filter((operation) => unloadedTons(operation) === 0).length} navio(s)</p>
        </div>
        <div>
          {data.operations
            .filter((operation) => unloadedTons(operation) === 0)
            .map((operation) => (
              <Link key={operation.id} href={`/operations/${operation.id}`} className="flex items-center justify-between gap-4 border-t border-slate-100 px-5 py-4 first:border-t-0 hover:bg-slate-50">
                <div>
                  <div className="font-semibold">{operation.vesselName}</div>
                  <div className="text-sm text-slate-500">{operation.code} · {operation.berth} · {operation.productSummary}</div>
                </div>
                <div className="text-sm font-semibold">{formatTons(plannedTons(operation))} t</div>
              </Link>
            ))}
        </div>
      </section>
    </div>
  );
}


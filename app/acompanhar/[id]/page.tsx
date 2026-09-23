import Link from "next/link";
import { notFound } from "next/navigation";
import { RhythmChart } from "@/components/charts/rhythm-chart";
import { Progress } from "@/components/ui/progress";
import { formatTons, pct } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { getOperation, operationProgress, plannedTons, unloadedTons } from "@/services/queries";

export const dynamic = "force-dynamic";

export default async function FollowPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const operation = await getOperation(session.companyId, id);
  if (!operation) notFound();
  const planned = plannedTons(operation);
  const unloaded = unloadedTons(operation);
  const progress = operationProgress(operation);

  const byWarehouse = operation.planningItems.map((item) => {
    const done = operation.dischargeRecords.filter((record) => record.planningItemId === item.id).reduce((sum, record) => sum + Number(record.netWeightTons), 0);
    return { label: item.warehouse, percent: item.quantityTons ? (done / Number(item.quantityTons)) * 100 : 0 };
  });

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white">
      <div className="mx-auto max-w-5xl">
        <Link href={`/operations/${operation.id}`} className="text-sm text-slate-300">Voltar</Link>
        <header className="mt-4 rounded-lg border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-semibold uppercase text-sky-300">Tapport</div>
          <h1 className="mt-2 text-3xl font-bold">{operation.vesselName}</h1>
          <p className="text-slate-300">{operation.berth} · {operation.productSummary} · Ao vivo</p>
        </header>
        <section className="mt-5 rounded-lg border border-white/10 bg-white p-5 text-slate-950">
          <div className="text-xs font-semibold uppercase text-slate-500">Progresso da descarga</div>
          <div className="mt-3 text-5xl font-bold">{pct(progress)}</div>
          <div className="mt-4"><Progress value={progress} /></div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div><div className="text-xs uppercase text-slate-500">Descarregado</div><div className="text-2xl font-bold">{formatTons(unloaded)} t</div></div>
            <div><div className="text-xs uppercase text-slate-500">Planejado</div><div className="text-2xl font-bold">{formatTons(planned)} t</div></div>
            <div><div className="text-xs uppercase text-slate-500">A descarregar</div><div className="text-2xl font-bold">{formatTons(planned - unloaded)} t</div></div>
          </div>
        </section>
        <section className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <h2 className="font-bold">Armazéns</h2>
            <div className="mt-4 space-y-3">
              {byWarehouse.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex justify-between text-sm"><span>{item.label}</span><span>{pct(item.percent)}</span></div>
                  <Progress value={item.percent} />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <h2 className="font-bold">Indicadores</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-white/10 p-3"><div className="text-slate-300">Ritmo</div><div className="text-xl font-bold">—</div></div>
              <div className="rounded-lg bg-white/10 p-3"><div className="text-slate-300">Caminhões hoje</div><div className="text-xl font-bold">{operation.dischargeRecords.length}</div></div>
              <div className="rounded-lg bg-white/10 p-3"><div className="text-slate-300">Turno atual</div><div className="text-xl font-bold">Noite</div></div>
              <div className="rounded-lg bg-white/10 p-3"><div className="text-slate-300">Término em</div><div className="text-xl font-bold">—</div></div>
            </div>
          </div>
        </section>
        <section className="mt-5 rounded-lg border border-white/10 bg-white p-5 text-slate-950">
          <h2 className="font-bold">Evolução por dia (t)</h2>
          <RhythmChart data={operation.dischargeRecords.map((record) => ({ label: record.date.toLocaleDateString("pt-BR"), tons: Number(record.netWeightTons) }))} />
        </section>
      </div>
    </main>
  );
}


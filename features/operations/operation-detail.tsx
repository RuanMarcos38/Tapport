import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Play, Plus } from "lucide-react";
import { createPlanningItemAction, recalculateOperationAction } from "@/app/actions/operations";
import { RhythmChart } from "@/components/charts/rhythm-chart";
import { PageHeader } from "@/components/layout/app-shell";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/components/ui/stat-card";
import { formatDate, formatDateTime, formatTons, pct } from "@/lib/format";
import { getOperation, operationProgress, plannedTons, unloadedTons } from "@/services/queries";

type OperationDetailData = NonNullable<Awaited<ReturnType<typeof getOperation>>>;

const tabs = [
  ["Capa", ""],
  ["Ao vivo", "live"],
  ["Descarga", "unloading"],
  ["Plano", "planning"],
  ["Relatórios", "reports"],
  ["Rateio", "rateio"],
  ["CAR DIR", "car-dir"]
] as const;

export async function OperationDetail({ companyId, id, tab }: { companyId: string; id: string; tab: string }) {
  const operation = await getOperation(companyId, id);
  if (!operation) notFound();

  const planned = plannedTons(operation);
  const unloaded = unloadedTons(operation);
  const progress = operationProgress(operation);
  const base = `/operations/${operation.id}`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/operations" className="text-sm text-slate-500 hover:text-slate-900">Todas as operações</Link>
        <div className="flex flex-wrap gap-2">
          <Link href={`/acompanhar/${operation.id}`} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium">Abrir acompanhamento</Link>
          <Link href={`/balanca/${operation.id}`} className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white">Abrir balança</Link>
        </div>
      </div>

      <div className="mb-5 overflow-x-auto border-b border-slate-200 tapport-scrollbar">
        <div className="flex min-w-max gap-1">
          {tabs.map(([label, slug]) => {
            const href = slug ? `${base}/${slug}` : base;
            const active = tab === slug || (!tab && !slug);
            return (
              <Link key={label} href={href} className={active ? "border-b-2 border-sky-500 px-3 py-2 text-sm font-semibold text-slate-950" : "px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-900"}>
                {label}
              </Link>
            );
          })}
        </div>
      </div>

      {tab === "live" ? <LiveTab operation={operation} progress={progress} planned={planned} unloaded={unloaded} /> : null}
      {tab === "unloading" ? <UnloadingTab operation={operation} /> : null}
      {tab === "planning" ? <PlanningTab operation={operation} /> : null}
      {tab === "reports" ? <ReportsTab operation={operation} progress={progress} planned={planned} unloaded={unloaded} /> : null}
      {tab === "rateio" ? <RateioTab operation={operation} /> : null}
      {tab === "car-dir" ? <CarDirTab operation={operation} /> : null}
      {!tab ? <CoverTab operation={operation} progress={progress} planned={planned} unloaded={unloaded} /> : null}
    </div>
  );
}

function CoverTab({
  operation,
  planned,
  unloaded,
  progress
}: {
  operation: OperationDetailData;
  planned: number;
  unloaded: number;
  progress: number;
}) {
  const last = operation.dischargeRecords[0];
  const chart = operation.dischargeRecords
    .slice()
    .reverse()
    .map((record, index) => ({ label: formatDate(record.date), tons: Number(record.netWeightTons), trucks: index + 1 }));

  return (
    <div>
      <PageHeader
        eyebrow="Capa da operação"
        title={operation.vesselName}
        description={`${operation.status} · ${operation.code} · ${operation.berth} · São Francisco do Sul`}
        action={<button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white"><Play className="mr-2 inline h-4 w-4" />Play</button>}
      />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Planejado" value={`${formatTons(planned)} t`} />
        <StatCard label="Descarregado" value={`${formatTons(unloaded)} t`} />
        <StatCard label="Saldo" value={`${formatTons(planned - unloaded)} t`} />
        <StatCard label="Caminhões" value={operation.dischargeRecords.length} />
      </div>
      <section className="mt-5 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">Progresso geral</h2>
            <span className="font-semibold text-sky-700">{pct(progress)}</span>
          </div>
          <Progress value={progress} />
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <StatCard label="Ritmo" value={operation.dischargeRecords.length ? "sem ritmo recente" : "sem base"} />
            <StatCard label="Ciclo médio" value="sem dado" />
            <StatCard label="Previsão de término" value={operation.dischargeRecords.length ? "pausada" : "sem base"} />
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold">Último caminhão</h2>
          {last ? (
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <div className="text-2xl font-bold">{last.plate ?? "-"}</div>
              <div className="text-sm text-slate-500">{last.hold.name} · {last.planningItem.product} · {formatTons(last.netWeightTons)} t</div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Nenhum caminhão registrado.</p>
          )}
        </div>
      </section>
      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="font-bold">Mapa dos porões</h2>
        <p className="text-sm text-slate-500">{operation.holds.length} no plano · saldo em destaque</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {operation.holds.map((hold) => {
            const holdUnloaded = operation.dischargeRecords.filter((record) => record.holdId === hold.id).reduce((sum, record) => sum + Number(record.netWeightTons), 0);
            const holdPlanned = Number(hold.plannedTons);
            return (
              <div key={hold.id} className="rounded-lg border border-slate-200 p-4">
                <div className="font-semibold uppercase">{hold.name}</div>
                <div className="mt-3 text-2xl font-bold">{formatTons(holdPlanned - holdUnloaded)} t</div>
                <Progress value={holdPlanned ? (holdUnloaded / holdPlanned) * 100 : 0} />
                <div className="mt-2 text-sm text-slate-500">{formatTons(holdUnloaded)} / {formatTons(holdPlanned)}</div>
              </div>
            );
          })}
        </div>
      </section>
      <SummaryTables operation={operation} />
      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="font-bold">Ritmo da descarga</h2>
        <p className="text-sm text-slate-500">toneladas por dia</p>
        <RhythmChart data={chart.length ? chart : [{ label: "sem dados", tons: 0 }]} />
      </section>
    </div>
  );
}

function LiveTab({ operation, planned, unloaded }: { operation: OperationDetailData; planned: number; unloaded: number; progress: number }) {
  const byWarehouse = new Map<string, { trucks: number; tons: number; last?: string }>();
  for (const record of operation.dischargeRecords) {
    const current = byWarehouse.get(record.planningItem.warehouse) ?? { trucks: 0, tons: 0 };
    byWarehouse.set(record.planningItem.warehouse, {
      trucks: current.trucks + 1,
      tons: current.tons + Number(record.netWeightTons),
      last: `${record.plate ?? "-"} · ${record.planningItem.di}`
    });
  }
  return (
    <div>
      <PageHeader title="Sala em tempo real" description="Fila por armazém • atualizado agora" />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Ao vivo" value={`${operation.dischargeRecords.length} registros`} />
        <StatCard label="Última atualização" value={formatDateTime(operation.dischargeRecords[0]?.date)} />
        <StatCard label="Análise preditiva" value="pausada" detail={`Saldo de ${formatTons(planned - unloaded)} t`} />
        <StatCard label="São Francisco do Sul" value="15°C" detail="Garoa fraca · vento 17 km/h" />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {[...byWarehouse.entries()].map(([warehouse, info]) => (
          <section key={warehouse} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <div className="text-xs font-semibold uppercase text-slate-500">Terminal</div>
            <h2 className="mt-2 text-2xl font-bold">{warehouse}</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <StatCard label="Caminhões" value={info.trucks} />
              <StatCard label="Toneladas" value={`${formatTons(info.tons)} t`} />
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">{info.last}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

function UnloadingTab({ operation }: { operation: OperationDetailData }) {
  const last = operation.dischargeRecords[0];
  return (
    <div>
      <PageHeader
        title="Registro de Descarga"
        description="O que já entrou neste navio — use Abrir balança na barra da operação"
        action={<Link href={`/balanca/${operation.id}`} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Lançar no escritório</Link>}
      />
      {last ? <StatCard label="Último lançamento" value={`${last.plate ?? "-"} · ${last.hold.name} · ${formatTons(last.netWeightTons)} t`} /> : null}
      <DischargeTable operation={operation} />
    </div>
  );
}

function PlanningTab({ operation }: { operation: OperationDetailData }) {
  const products = [...new Set(operation.planningItems.map((item) => item.product))];
  const warehouses = [...new Set(operation.planningItems.map((item) => item.warehouse))];
  return (
    <div>
      <PageHeader
        title="Planejamento"
        description="Grade de planejamento desta operação"
        action={
          <div className="flex gap-2">
            <form action={recalculateOperationAction}>
              <input type="hidden" name="operationId" value={operation.id} />
              <button className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Recalcular</button>
            </form>
            <button className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold">Baixar PDF</button>
          </div>
        }
      />
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold">Matriz Produto × Armazém (Planejado)</h2>
        <div className="mt-4 overflow-x-auto tapport-scrollbar">
          <table className="min-w-[640px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr><th className="px-3 py-2">Armazém</th>{products.map((product) => <th key={product} className="px-3 py-2">{product}</th>)}<th className="px-3 py-2">Total</th></tr>
            </thead>
            <tbody>
              {warehouses.map((warehouse) => {
                const total = operation.planningItems.filter((item) => item.warehouse === warehouse).reduce((sum, item) => sum + Number(item.quantityTons), 0);
                return (
                  <tr key={warehouse} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold">{warehouse}</td>
                    {products.map((product) => <td key={product} className="px-3 py-2">{formatTons(operation.planningItems.filter((item) => item.warehouse === warehouse && item.product === product).reduce((sum, item) => sum + Number(item.quantityTons), 0))}</td>)}
                    <td className="px-3 py-2 font-semibold">{formatTons(total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="text-xl font-bold">Grade de Planejamento</h2>
        <form action={createPlanningItemAction} className="mt-4 grid gap-3 lg:grid-cols-8">
          <input type="hidden" name="operationId" value={operation.id} />
          {["di", "client", "product", "quantityTons", "warehouse", "destination", "carrier"].map((field) => (
            <input key={field} name={field} placeholder={field} className="h-10 rounded-md border border-slate-200 px-3 text-sm" />
          ))}
          <button className="rounded-md bg-slate-950 px-3 text-sm font-semibold text-white"><Plus className="mr-1 inline h-4 w-4" />Adicionar</button>
        </form>
        <PlanningTable operation={operation} />
      </section>
    </div>
  );
}

function ReportsTab({ operation, planned, unloaded, progress }: { operation: OperationDetailData; planned: number; unloaded: number; progress: number }) {
  return (
    <div>
      <PageHeader title="Relatório de Descarga" description="Grade diária da operação · pesos em toneladas" />
      <div className="grid gap-4 md:grid-cols-4">
        {["Plano", "Parcial", "Completo", "Detalhado"].map((document) => (
          <button key={document} className="rounded-lg border border-slate-200 bg-white p-4 text-left shadow-soft">
            <div className="font-semibold">{document}</div>
            <div className="mt-2 text-sm text-slate-500">PDF operacional</div>
            <div className="mt-4 text-sm font-semibold text-sky-700"><Download className="mr-1 inline h-4 w-4" />Baixar</div>
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <StatCard label="Planejado" value={`${formatTons(planned)} t`} />
        <StatCard label="Descarregado" value={`${formatTons(unloaded)} t`} />
        <StatCard label="Saldo" value={`${formatTons(planned - unloaded)} t`} />
        <StatCard label="Conclusão" value={pct(progress)} />
      </div>
      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="font-bold">Dia 1: {formatDate(operation.dischargeRecords.at(-1)?.date)}</h2>
        <DischargeTable operation={operation} compact />
      </section>
    </div>
  );
}

function RateioTab({ operation }: { operation: OperationDetailData }) {
  return (
    <div>
      <PageHeader title="RATEIO" description="Encerramento por porão e por recebedor/DI." action={<button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Salvar campos manuais</button>} />
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="font-bold">Porões</h2>
        <SimpleHoldTable operation={operation} />
      </section>
      <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="font-bold">Recebedores</h2>
        <PlanningTable operation={operation} rateio />
      </section>
    </div>
  );
}

function CarDirTab({ operation }: { operation: OperationDetailData }) {
  return (
    <div>
      <PageHeader title="CAR DIR" description="Cruzamento DI × Produto × Transportadora × Destino." />
      <form className="mb-5 grid gap-3 md:grid-cols-5">
        {["DI", "Produto", "Transportadora", "Destino"].map((placeholder) => (
          <input key={placeholder} placeholder={placeholder} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm" />
        ))}
        <button className="rounded-md bg-slate-950 px-4 text-sm font-semibold text-white">Filtrar</button>
      </form>
      <PlanningTable operation={operation} carDir />
      <div className="mt-4 text-sm font-semibold text-slate-600">
        Total plano {formatTons(plannedTons(operation))} t · descarga {formatTons(unloadedTons(operation))} t · saldo {formatTons(plannedTons(operation) - unloadedTons(operation))} t
      </div>
    </div>
  );
}

function SummaryTables({ operation }: { operation: OperationDetailData }) {
  return (
    <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-bold">Resumo Geral</h2>
          <p className="text-sm text-slate-500">Planejado × retirado por produto, armazém, porão e DI</p>
        </div>
        <div className="flex gap-2 text-sm">
          <select className="rounded-md border border-slate-200 px-3 py-2"><option>Todos</option><option>Manhã</option><option>Tarde</option><option>Noite</option></select>
          <input type="date" className="rounded-md border border-slate-200 px-3 py-2" />
          <input type="date" className="rounded-md border border-slate-200 px-3 py-2" />
        </div>
      </div>
      <SimpleHoldTable operation={operation} />
    </section>
  );
}

function SimpleHoldTable({ operation }: { operation: OperationDetailData }) {
  return (
    <div className="mt-4 overflow-x-auto tapport-scrollbar">
      <table className="min-w-[640px] w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr><th className="px-3 py-2">Porão</th><th className="px-3 py-2">Planejado</th><th className="px-3 py-2">Descarregado</th><th className="px-3 py-2">Saldo</th></tr>
        </thead>
        <tbody>
          {operation.holds.map((hold) => {
            const unloaded = operation.dischargeRecords.filter((record) => record.holdId === hold.id).reduce((sum, record) => sum + Number(record.netWeightTons), 0);
            const planned = Number(hold.plannedTons);
            return <tr key={hold.id} className="border-t border-slate-100"><td className="px-3 py-2 font-semibold">{hold.name}</td><td className="px-3 py-2">{formatTons(planned)}</td><td className="px-3 py-2">{formatTons(unloaded)}</td><td className="px-3 py-2">{formatTons(planned - unloaded)}</td></tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

function PlanningTable({ operation, rateio = false, carDir = false }: { operation: OperationDetailData; rateio?: boolean; carDir?: boolean }) {
  return (
    <div className="mt-4 overflow-x-auto tapport-scrollbar">
      <table className="min-w-[980px] w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            {(carDir ? ["DI", "Produto", "Armazém", "Transportadora", "Destino", "Plano", "Descarga", "Saldo", "%"] : rateio ? ["DI", "Armazém", "Manifestado", "Parcial", "Final", "%", "Segregada", "Varredura lançada", "A retirar (P)", "Rateio a retirar"] : ["Seq", "DI", "Cliente", "Produto", "Quantidade (t)", "Situação", "Armazém", "Destino", "Porões (t)", "Transportadora"]).map((header) => (
              <th key={header} className="px-3 py-2">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {operation.planningItems.map((item) => {
            const discharged = operation.dischargeRecords.filter((record) => record.planningItemId === item.id).reduce((sum, record) => sum + Number(record.netWeightTons), 0);
            const planned = Number(item.quantityTons);
            if (carDir) {
              return <tr key={item.id} className="border-t border-slate-100"><td className="px-3 py-2">{item.di}</td><td className="px-3 py-2">{item.product}</td><td className="px-3 py-2">{item.warehouse}</td><td className="px-3 py-2">{item.carrier}</td><td className="px-3 py-2">{item.destination}</td><td className="px-3 py-2">{formatTons(planned)}</td><td className="px-3 py-2">{formatTons(discharged)}</td><td className="px-3 py-2">{formatTons(planned - discharged)}</td><td className="px-3 py-2">{pct(planned ? (discharged / planned) * 100 : 0)}</td></tr>;
            }
            if (rateio) {
              return <tr key={item.id} className="border-t border-slate-100"><td className="px-3 py-2">{item.di}</td><td className="px-3 py-2">{item.warehouse}</td><td className="px-3 py-2">{formatTons(planned)}</td><td className="px-3 py-2">{formatTons(discharged)}</td><td className="px-3 py-2"><input type="number" className="h-8 w-28 rounded-md border border-slate-200 px-2" /></td><td className="px-3 py-2">{pct(planned ? (discharged / planned) * 100 : 0)}</td><td className="px-3 py-2"><input type="number" className="h-8 w-24 rounded-md border border-slate-200 px-2" /></td><td className="px-3 py-2">0,000</td><td className="px-3 py-2"><input type="number" className="h-8 w-24 rounded-md border border-slate-200 px-2" /></td><td className="px-3 py-2"><input type="number" className="h-8 w-24 rounded-md border border-slate-200 px-2" /></td></tr>;
            }
            return <tr key={item.id} className="border-t border-slate-100"><td className="px-3 py-2">{item.sequence}</td><td className="px-3 py-2">{item.di}</td><td className="px-3 py-2">{item.client}</td><td className="px-3 py-2">{item.product}</td><td className="px-3 py-2">{formatTons(item.quantityTons)}</td><td className="px-3 py-2">{item.situation}</td><td className="px-3 py-2">{item.warehouse}</td><td className="px-3 py-2">{item.destination}</td><td className="px-3 py-2">{item.holds.map((hold) => `${hold.hold.code} ${formatTons(hold.tons)}`).join(", ")}</td><td className="px-3 py-2">{item.carrier}</td></tr>;
          })}
        </tbody>
      </table>
    </div>
  );
}

function DischargeTable({ operation, compact = false }: { operation: OperationDetailData; compact?: boolean }) {
  return (
    <section className="mt-5 rounded-lg border border-slate-200 bg-white shadow-soft">
      {!compact ? <div className="border-b border-slate-100 p-5"><h2 className="font-bold">Registros de Descarga</h2><p className="text-sm text-slate-500">Últimos caminhões registrados nesta operação.</p></div> : null}
      <div className="overflow-x-auto tapport-scrollbar">
        <table className="min-w-[1320px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>{["Di", "Data", "Turno", "Porão", "Armazém", "DI", "Cliente", "Produto", "Peso Líquido (t)", "Placa", "Ticket", "Tempo Serviço (min)"].map((header) => <th key={header} className="px-3 py-2">{header}</th>)}</tr>
          </thead>
          <tbody>
            {operation.dischargeRecords.map((record) => (
              <tr key={record.id} className="border-t border-slate-100">
                <td className="px-3 py-2">{record.planningItem.sequence}</td>
                <td className="px-3 py-2">{formatDate(record.date)}</td>
                <td className="px-3 py-2">{record.shift}</td>
                <td className="px-3 py-2">{record.hold.name}</td>
                <td className="px-3 py-2">{record.planningItem.warehouse}</td>
                <td className="px-3 py-2">{record.planningItem.di}</td>
                <td className="px-3 py-2">{record.planningItem.client}</td>
                <td className="px-3 py-2">{record.planningItem.product}</td>
                <td className="px-3 py-2">{formatTons(record.netWeightTons)}</td>
                <td className="px-3 py-2">{record.plate ?? "-"}</td>
                <td className="px-3 py-2">{record.ticket ?? "-"}</td>
                <td className="px-3 py-2">{record.serviceTimeMinutes ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-slate-100 p-3 text-sm text-slate-500">Mostrando {operation.dischargeRecords.length} registros</div>
    </section>
  );
}


import Link from "next/link";
import { notFound } from "next/navigation";
import { createDischargeRecordAction } from "@/app/actions/operations";
import { formatDate, formatTons } from "@/lib/format";
import { requireSession } from "@/lib/auth";
import { getOperation } from "@/services/queries";

export const dynamic = "force-dynamic";

export default async function ScalePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const operation = await getOperation(session.companyId, id);
  if (!operation) notFound();
  const last = operation.dischargeRecords[0];

  return (
    <main className="min-h-screen bg-slate-100 p-5">
      <div className="mx-auto grid max-w-[1440px] gap-5 xl:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase text-slate-500">Tapport · Balança</div>
              <h1 className="mt-1 text-3xl font-bold">{operation.vesselName}</h1>
              <p className="text-sm text-slate-500">{operation.berth} · lançar na mão ou conferir o que vier da API</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/operations/${operation.id}`} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold">Voltar à capa</Link>
              <Link href={`/acompanhar/${operation.id}`} className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white">Acompanhamento</Link>
            </div>
          </div>

          <form action={createDischargeRecordAction} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
            <input type="hidden" name="operationId" value={operation.id} />
            <h2 className="text-xl font-bold">Lançar caminhão</h2>
            <p className="mt-1 text-sm text-slate-500">A DI puxa armazém e cliente do plano.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {operation.planningItems.map((item) => {
                const unloaded = operation.dischargeRecords.filter((record) => record.planningItemId === item.id).reduce((sum, record) => sum + Number(record.netWeightTons), 0);
                return (
                  <button key={item.id} type="button" className="rounded-lg border border-slate-200 p-4 text-left hover:bg-slate-50">
                    <div className="font-semibold">{item.warehouse}</div>
                    <div className="text-sm text-slate-500">{item.di} · {item.product} · {item.client}</div>
                    <div className="mt-2 text-sm text-slate-500">Saldo {formatTons(Number(item.quantityTons) - unloaded)} t</div>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-semibold">
                Sequência (Di) *
                <input name="sequence" type="number" min="1" placeholder="1" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3" />
              </label>
              <label className="block text-sm font-semibold">
                Porão *
                <select name="holdId" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3">
                  {operation.holds.map((hold) => <option key={hold.id} value={hold.id}>{hold.name}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold">
                Data *
                <input name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3" />
              </label>
              <label className="block text-sm font-semibold">
                Turno *
                <select name="shift" className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3">
                  {["Manhã", "Tarde", "Noite", "Madrugada"].map((shift) => <option key={shift}>{shift}</option>)}
                </select>
              </label>
            </div>
            <label className="mt-4 block text-sm font-semibold">
              Peso Líquido (t) *
              <input name="netWeightTons" type="number" step="0.001" placeholder="0,000" className="mt-1 h-14 w-full rounded-md border border-slate-200 px-3 text-center text-2xl font-bold" />
            </label>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <input name="isSweep" type="checkbox" />
              Varredura / sobras
            </label>
            <details open className="mt-5 rounded-lg border border-slate-200 p-4">
              <summary className="cursor-pointer font-semibold">Campos Opcionais</summary>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input name="plate" placeholder="Placa do Caminhão" className="h-11 rounded-md border border-slate-200 px-3" />
                <input name="ticket" placeholder="Número do Ticket" className="h-11 rounded-md border border-slate-200 px-3" />
                <input name="entryTime" type="time" className="h-11 rounded-md border border-slate-200 px-3" />
                <input name="exitTime" type="time" className="h-11 rounded-md border border-slate-200 px-3" />
                <input name="notes" placeholder="Observações" className="h-11 rounded-md border border-slate-200 px-3 md:col-span-2" />
              </div>
            </details>
            <button className="mt-5 h-12 w-full rounded-md bg-slate-950 font-semibold text-white">Registrar descarga</button>
          </form>

          <section className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-soft tapport-scrollbar">
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
          </section>
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="font-bold">Fila da balança</h2>
            <p className="mt-2 text-sm text-slate-500">Nenhum ticket pendente da API.</p>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="font-bold">Último lançamento</h2>
            {last ? <p className="mt-3 text-sm text-slate-600">{last.plate} · {last.hold.name} · {formatTons(last.netWeightTons)} t</p> : <p className="mt-3 text-sm text-slate-500">Sem lançamentos.</p>}
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="font-bold">Últimos do turno</h2>
            <div className="mt-3 space-y-3">
              {operation.dischargeRecords.slice(0, 4).map((record) => (
                <div key={record.id} className="rounded-lg bg-slate-50 p-3 text-sm">
                  <div className="font-semibold">{record.plate ?? "-"}</div>
                  <div className="text-slate-500">{record.hold.name} · {formatTons(record.netWeightTons)} t · {record.planningItem.di}</div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}


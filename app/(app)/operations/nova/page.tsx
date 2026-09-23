import Link from "next/link";
import { createOperationAction } from "@/app/actions/operations";
import { PageHeader } from "@/components/layout/app-shell";
import { requireSession } from "@/lib/auth";

export default async function NewOperationPage() {
  await requireSession();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow="Abrir operação" title="O navio" description="Nome, berço e o dia em que a operação começa." />
      <form action={createOperationAction} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <label className="block text-sm font-semibold">
          Navio
          <input name="vesselName" placeholder="Nome do navio" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3" />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Início da operação
            <input name="startedAt" type="date" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3" />
          </label>
          <label className="block text-sm font-semibold">
            Berço
            <select name="berth" defaultValue="Berço 102" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3">
              {["101", "102", "103", "201", "300", "301", "301B", "302", "Berço 102", "Berço 201"].map((berth) => (
                <option key={berth}>{berth}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-4 block text-sm font-semibold">
          Cliente
          <input name="importer" placeholder="Opcional — armazém do plano" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3" />
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <Link href="/operations" className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold">Cancelar</Link>
          <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Abrir e ir ao plano</button>
        </div>
      </form>
    </div>
  );
}

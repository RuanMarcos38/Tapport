import { MasterDataType } from "@prisma/client";
import Link from "next/link";
import { createMasterDataAction, deactivateMasterDataAction, updateMasterDataAction } from "@/app/actions/master-data";
import { PageHeader } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { requireSession } from "@/lib/auth";
import { getMasterCounts, getMasterData } from "@/services/queries";

const tabs: Array<[MasterDataType, string, string]> = [
  ["CLIENT", "Clientes", "clientes"],
  ["PRODUCT", "Produtos", "produtos"],
  ["WAREHOUSE", "Armazéns", "armazéns"],
  ["DESTINATION", "Destinos", "destinos"],
  ["CARRIER", "Transportadoras", "transportadoras"],
  ["HOLD", "Porões", "porões"],
  ["SHIFT", "Turnos", "turnos"],
  ["STATUS", "Status", "status"],
  ["BERTH", "Berços", "berços"],
  ["PLATE", "Placas", "placas"]
];

export const dynamic = "force-dynamic";

export default async function MasterDataPage({
  searchParams
}: {
  searchParams: Promise<{ type?: MasterDataType; q?: string; new?: string; edit?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const type = params.type ?? "CLIENT";
  const tab = tabs.find(([key]) => key === type) ?? tabs[0];
  const items = await getMasterData(session.companyId, type, params.q);
  const counts = await getMasterCounts(session.companyId);

  return (
    <div>
      <PageHeader title="Cadastros" description="Clientes, produtos, armazéns e demais listas do plano" />
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map(([key, label]) => (
          <Link key={key} href={`/master-data?type=${key}`} className={key === type ? "rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white" : "rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold"}>
            {label}
          </Link>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <form className="flex gap-2">
          <input type="hidden" name="type" value={type} />
          <input name="q" defaultValue={params.q ?? ""} placeholder={`Buscar ${tab[2]}...`} className="h-10 w-72 rounded-md border border-slate-200 bg-white px-3 text-sm" />
          <button className="rounded-md border border-slate-200 bg-white px-4 text-sm font-medium">Buscar</button>
        </form>
        <Link href={`/master-data?type=${type}&new=1`} className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Novo {tab[1].replace(/s$/, "")}</Link>
      </div>
      {params.new ? (
        <form action={createMasterDataAction} className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-soft md:grid-cols-[1fr_1fr_auto]">
          <input type="hidden" name="type" value={type} />
          <input name="name" placeholder="Nome" className="h-10 rounded-md border border-slate-200 px-3" />
          <input name="code" placeholder="Código (opcional)" className="h-10 rounded-md border border-slate-200 px-3" />
          <button className="rounded-md bg-slate-950 px-4 text-sm font-semibold text-white">Salvar</button>
        </form>
      ) : null}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-soft tapport-scrollbar">
        <table className="min-w-[760px] w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Nome</th><th className="px-4 py-3">Código</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Ações</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                {params.edit === item.id ? (
                  <td colSpan={4} className="px-4 py-3">
                    <form action={updateMasterDataAction} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                      <input type="hidden" name="id" value={item.id} />
                      <input name="name" defaultValue={item.name} className="h-10 rounded-md border border-slate-200 px-3" />
                      <input name="code" defaultValue={item.code} className="h-10 rounded-md border border-slate-200 px-3" />
                      <button className="rounded-md bg-slate-950 px-4 text-sm font-semibold text-white">Salvar</button>
                    </form>
                  </td>
                ) : (
                  <>
                    <td className="px-4 py-3 font-semibold">{item.name}</td>
                    <td className="px-4 py-3">{item.code}</td>
                    <td className="px-4 py-3">{item.active ? "Ativo" : "Inativo"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/master-data?type=${type}&edit=${item.id}`} className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold">Editar</Link>
                        <form action={deactivateMasterDataAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <button className="rounded-md border border-red-200 px-3 py-1 text-xs font-semibold text-red-700">Desativar</button>
                        </form>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-slate-100 p-3 text-sm text-slate-500">Showing {items.length} of {items.length} rows</div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-4">
        {tabs.slice(0, 4).map(([key, label]) => <StatCard key={key} label={label} value={counts[key] ?? 0} detail="itens cadastrados" />)}
      </div>
    </div>
  );
}

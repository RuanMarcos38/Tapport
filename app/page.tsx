import Link from "next/link";

export default function PublicHomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-lg font-bold tracking-normal">
          TAPPORT
        </Link>
        <Link href="/login" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950">
          Entrar
        </Link>
      </header>
      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <div className="text-sm font-semibold uppercase text-sky-300">São Francisco do Sul</div>
          <h1 className="mt-6 max-w-3xl text-6xl font-bold tracking-normal max-sm:text-4xl">
            A operação portuária no ritmo da balança.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            O caminhão pesa, a sala acompanha e o navio mostra saldo, ritmo, porão e previsão sem planilhas paralelas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="rounded-md bg-sky-500 px-5 py-3 text-sm font-semibold text-white hover:bg-sky-400">
              Entrar na operação
            </Link>
            <Link href="/onboarding" className="rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10">
              Como funciona
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-white p-5 text-slate-950 shadow-2xl">
          <div className="text-xs font-semibold uppercase text-slate-500">Tapport · MV HORIZON</div>
          <div className="mt-4 rounded-lg bg-slate-50 p-5">
            <div className="text-xs font-semibold uppercase text-sky-700">Capa da operação</div>
            <h2 className="mt-2 text-3xl font-bold">MV HORIZON</h2>
            <p className="mt-1 text-sm text-slate-500">Berço 102 · Soda Ash · São Francisco do Sul</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ["Planejado", "37.527 t"],
                ["Descarregado", "25.470 t"],
                ["Saldo", "12.057 t"],
                ["Caminhões", "70"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
                  <div className="mt-2 text-2xl font-bold">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
              Porão 02 aceita mais duas viagens. Se o ritmo seguir, fecha no próximo turno.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


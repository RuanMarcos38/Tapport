import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-bold">
          TAPPORT
        </Link>
        <Link href="/login" className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950">
          Entrar no sistema
        </Link>
      </header>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2">
        <div>
          <div className="text-sm font-semibold uppercase text-sky-300">Operação portuária</div>
          <h1 className="mt-6 text-5xl font-bold tracking-normal max-sm:text-4xl">Da balança para a capa do navio.</h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            O Tapport conecta planejamento, descarga, balança e relatórios em um fluxo único para equipes de terminal.
          </p>
          <Link href="/login" className="mt-8 inline-block rounded-md bg-sky-500 px-5 py-3 text-sm font-semibold">
            Acessar operação
          </Link>
        </div>
        <div className="rounded-lg bg-white p-5 text-slate-950 shadow-2xl">
          <div className="text-xs font-semibold uppercase text-slate-500">Tapport · Produção</div>
          <div className="mt-4 rounded-lg bg-slate-50 p-5">
            <div className="text-xs font-semibold uppercase text-sky-700">Capa da operação</div>
            <h2 className="mt-2 text-3xl font-bold">Operação em tempo real</h2>
            <p className="text-sm text-slate-500">Berço, produto e cliente configurados pelo tenant</p>
            <div className="mt-5 h-2 rounded-full bg-slate-200">
              <div className="h-2 w-2/3 rounded-full bg-sky-500" />
            </div>
            <p className="mt-4 text-sm text-slate-600">Indicadores são calculados a partir dos registros reais da operação.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

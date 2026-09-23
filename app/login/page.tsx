import Link from "next/link";
import { loginAction } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; tenant?: string; email?: string; next?: string; reset?: string }>;
}) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen bg-slate-950 lg:grid-cols-[1fr_560px]">
      <section className="hidden items-end bg-slate-950 p-12 text-white lg:flex">
        <div>
          <Link href="/" className="text-lg font-bold">
            Tapport
          </Link>
          <div className="mt-24 text-sm font-semibold uppercase text-sky-300">Sistema online</div>
          <h1 className="mt-5 max-w-2xl text-5xl font-bold tracking-normal">Precisão total na logística portuária</h1>
          <p className="mt-5 max-w-xl text-slate-300">
            Os dados da balança entram sozinhos. A sala vê peso, ritmo e quando fechar o porão.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-2 gap-4">
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-2xl font-bold">52</div>
              <div className="text-xs uppercase text-slate-400">regras de negócio</div>
            </div>
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-2xl font-bold">99,9%</div>
              <div className="text-xs uppercase text-slate-400">uptime alvo</div>
            </div>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center bg-white p-6">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-slate-950">Bem-vindo de volta</h2>
          <p className="mt-2 text-sm text-slate-500">Insira suas credenciais para acessar o terminal.</p>
          {params.error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">Credenciais inválidas.</div> : null}
          {params.reset ? <div className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">Senha redefinida. Entre novamente.</div> : null}

          <form action={loginAction} className="mt-6 space-y-4">
            <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
            <label className="block text-sm font-semibold text-slate-700">
              Tenant / empresa
              <input name="tenantSlug" defaultValue={params.tenant ?? ""} placeholder="slug-da-empresa" className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-sky-500" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              E-mail corporativo
              <input name="email" type="email" defaultValue={params.email ?? ""} placeholder="usuario@empresa.com" className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-sky-500" />
            </label>
            <label className="block text-sm font-semibold text-slate-700">
              Senha
              <input name="password" type="password" placeholder="••••••••" className="mt-1 h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-sky-500" />
            </label>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input name="remember" type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                Manter conectado
              </label>
              <Link href="/forgot-password" className="font-medium text-sky-700">
                Recuperar senha
              </Link>
            </div>
            <button className="h-12 w-full rounded-xl bg-slate-950 font-semibold text-white hover:bg-slate-800">
              Entrar no sistema
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { requestPasswordResetAction } from "@/app/actions/auth";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <form action={requestPasswordResetAction} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold">Recuperar senha</h1>
        <p className="mt-2 text-sm text-slate-500">Informe tenant e e-mail para receber o link de redefinição.</p>
        {params.sent ? <div className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">Se o usuário existir, as instruções foram enviadas.</div> : null}
        <label className="mt-5 block text-sm font-semibold">
          Tenant
          <input name="tenantSlug" defaultValue="atlantico" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3" />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          E-mail
          <input name="email" type="email" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3" />
        </label>
        <button className="mt-5 h-10 w-full rounded-md bg-slate-950 font-semibold text-white">Enviar recuperação</button>
        <Link href="/login" className="mt-4 block text-center text-sm text-slate-500">
          Voltar ao login
        </Link>
      </form>
    </main>
  );
}

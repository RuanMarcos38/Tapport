import { resetPasswordAction } from "@/app/actions/auth";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string }> }) {
  const params = await searchParams;
  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 p-6">
      <form action={resetPasswordAction} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold">Redefinir senha</h1>
        {params.error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">Token inválido ou senha inconsistente.</div> : null}
        <input type="hidden" name="token" value={params.token ?? ""} />
        <label className="mt-5 block text-sm font-semibold">
          Nova senha
          <input name="password" type="password" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3" />
        </label>
        <label className="mt-4 block text-sm font-semibold">
          Confirmar nova senha
          <input name="confirm" type="password" className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3" />
        </label>
        <button className="mt-5 h-10 w-full rounded-md bg-slate-950 font-semibold text-white">Salvar nova senha</button>
      </form>
    </main>
  );
}


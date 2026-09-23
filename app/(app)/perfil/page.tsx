import { updateProfileAction } from "@/app/actions/auth";
import { PageHeader } from "@/components/layout/app-shell";
import { requireSession } from "@/lib/auth";
import { roleLabels } from "@/lib/rbac";

export default async function ProfilePage() {
  const session = await requireSession();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Perfil" description="Sua conta neste tenant." />
      <form action={updateProfileAction} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <label className="block text-sm font-semibold">
          Nome
          <input name="name" defaultValue={session.name} className="mt-1 h-11 w-full rounded-md border border-slate-200 px-3" />
        </label>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div><div className="text-sm font-semibold">E-mail</div><div className="mt-1 text-sm text-slate-500">{session.email}</div></div>
          <div><div className="text-sm font-semibold">Papel</div><div className="mt-1 text-sm text-slate-500">{roleLabels[session.role]}</div></div>
        </div>
        <h2 className="mt-8 text-lg font-bold">Trocar senha</h2>
        <div className="mt-3 grid gap-4">
          <input name="currentPassword" type="password" placeholder="Senha atual" className="h-11 rounded-md border border-slate-200 px-3" />
          <input name="newPassword" type="password" placeholder="Nova senha" className="h-11 rounded-md border border-slate-200 px-3" />
          <input name="confirmPassword" type="password" placeholder="Confirmar nova senha" className="h-11 rounded-md border border-slate-200 px-3" />
        </div>
        <button className="mt-6 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Salvar</button>
      </form>
    </div>
  );
}


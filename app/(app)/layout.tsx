import { AppShell } from "@/components/layout/app-shell";
import { requireSession } from "@/lib/auth";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return (
    <AppShell user={session.name} email={session.email} role={session.role}>
      {children}
    </AppShell>
  );
}


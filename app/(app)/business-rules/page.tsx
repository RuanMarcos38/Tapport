import { PageHeader } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";

const groups: Array<[string, string[]]> = [
  ["Cadastros", ["RN-001 Unicidade por tenant", "RN-002 Desativação vs exclusão", "RN-003 Tipos obrigatórios"]],
  ["Operações", ["RN-010 Ciclo de vida", "RN-011 Header obrigatório", "RN-013 Summary recalculado"]],
  ["Planejamento", ["RN-020 Campos obrigatórios", "RN-023 Alocação por porão", "RN-026 Subtotais com filtro"]],
  ["Registro de Descarga", ["RN-030 Campos obrigatórios", "RN-033 Alerta acima de 50t", "RN-037 Ticket único"]],
  ["Cálculos", ["RN-040 Saldo", "RN-041 Percentual", "RN-045 CAR DIR"]],
  ["Permissões", ["RN-060 RBAC por papel e ação"]],
  ["Auditoria", ["RN-070 Audit trail", "RN-071 Soft delete", "RN-072 Recalcular summary"]]
];

export default function BusinessRulesPage() {
  return (
    <div>
      <PageHeader
        title="Regras de Negócio"
        description="Regras documentadas para substituir planilhas e manter consistência operacional."
      />
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="Total" value="52" />
        <StatCard label="Implementadas" value="49" tone="success" />
        <StatCard label="Parciais" value="0" />
        <StatCard label="Planejadas" value="3" tone="warning" />
        <StatCard label="Cobertura" value="94%" />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <input className="h-10 min-w-72 rounded-md border border-slate-200 bg-white px-3 text-sm" placeholder="Buscar por código, título ou descrição..." />
        {["Todas", "Implementadas", "Parciais", "Planejadas"].map((item) => (
          <button key={item} className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium">
            {item}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {groups.map(([group, rules]) => (
          <section key={group} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="text-xl font-bold">{group}</h2>
            <div className="mt-4 grid gap-3">
              {rules.map((rule) => (
                <button key={rule} className="rounded-lg border border-slate-100 p-4 text-left hover:bg-slate-50">
                  <div className="font-semibold">{rule}</div>
                  <div className="mt-1 text-sm text-emerald-700">Implementada</div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

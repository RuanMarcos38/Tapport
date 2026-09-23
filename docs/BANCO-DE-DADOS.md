# Banco de Dados

## Entidades Principais

- `companies`
- `users`
- `company_users`
- `roles`
- `permissions`
- `role_permissions`
- `audit_logs`
- `master_data_items`
- `operations`
- `operation_holds`
- `planning_items`
- `planning_item_holds`
- `discharge_records`
- `password_reset_tokens`

## Isolamento

Tabelas empresariais possuem `company_id`.

O backend sempre valida a sessão antes de consultar ou alterar dados. A migração SQL também habilita RLS em tabelas multiempresa para impedir acesso horizontal caso uma consulta seja executada fora do escopo esperado.

## Auditoria

Registros críticos armazenam:
- usuário;
- empresa;
- ação;
- entidade;
- registro;
- dados anteriores;
- dados novos;
- data/hora;
- IP/user agent quando disponível.

## Soft Delete

Cadastros e registros operacionais usam `deleted_at` quando a exclusão física não é segura.


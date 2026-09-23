# Arquitetura Tapport

Tapport é um SaaS multiempresa para gestão de operações portuárias.

## Stack

- Next.js App Router.
- React + TypeScript.
- Tailwind CSS.
- PostgreSQL.
- Prisma ORM.
- Server Components para leituras.
- Server Actions para mutações internas.
- Route Handlers para endpoints externos e autenticação auxiliar.

## Camadas

- `app/`: rotas, layouts e páginas.
- `components/`: componentes visuais reutilizáveis.
- `features/`: componentes e ações por domínio.
- `lib/`: autenticação, banco, autorização, formatação e tokens.
- `services/`: acesso a dados com escopo de tenant.
- `database/`: migrations SQL, seeds e documentação.
- `types/`: tipos compartilhados.

## Segurança

- Sessão HTTP-only assinada.
- Senhas com hash bcrypt.
- Proteção de rotas via middleware.
- RBAC por papel e permissões.
- Todas as consultas de dados empresariais filtram `company_id`.
- Migração PostgreSQL habilita RLS nas tabelas multiempresa.
- Logs de auditoria para ações relevantes.

## Multi-tenancy

Cada dado operacional pertence a uma empresa (`company_id`).

Regras:
- Usuários comuns acessam somente empresas associadas.
- Operações, cadastros, planejamento, descarga e logs carregam o contexto da empresa autenticada.
- Super Admin tem painel separado e só acessa dados globais mediante permissão explícita.

## Domínios

- Autenticação.
- Empresas.
- Usuários e RBAC.
- Cadastros.
- Operações.
- Planejamento.
- Descarga/balança.
- Relatórios.
- Rateio/CAR DIR.
- Auditoria.


# Tapport

Tapport é um SaaS multiempresa para gestão portuária: operações de descarga, planejamento, balança, relatórios, cadastros, usuários, permissões e auditoria.

O produto foi reconstruído com código original a partir da auditoria visual e funcional do PortLine, usando a identidade TAPPORT e uma arquitetura própria com isolamento multiempresa.

## Tecnologias

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Server Actions
- RBAC multiempresa

## Requisitos

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+

## Instalação

```bash
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Variáveis

- `DATABASE_URL`: conexão PostgreSQL.
- `AUTH_SECRET`: segredo longo para assinar sessões HTTP-only.
- `NEXT_PUBLIC_APP_URL`: URL pública da aplicação.

## Banco de dados

O Prisma schema fica em `prisma/schema.prisma`.

Migrations oficiais:

- `prisma/migrations/20260922233000_initial/migration.sql`
- `prisma/migrations/20260922233100_rls_policies/migration.sql`

O diretório `database/migrations` mantém a documentação SQL de políticas e extensões relacionadas ao banco.

## Autenticação

O sistema usa sessão HTTP-only assinada, senha com bcrypt e proteção server-side de rotas.

## Multi-tenancy

Todos os dados empresariais possuem `company_id`. O backend filtra por empresa autenticada e as migrations habilitam RLS nas tabelas sensíveis.

## Permissões

Papéis:

- Super Admin
- Administrador da empresa
- Gestor
- Operador
- Visualizador

Permissões são mapeadas por módulo e ação.

## Desenvolvimento

```bash
pnpm dev
```

## Produção

```bash
pnpm build
pnpm start
```

## Qualidade

Comandos validados neste workspace:

```bash
pnpm test
pnpm typecheck
pnpm build
```

## Documentação

- `docs/AUDITORIA-PORTLINE.md`
- `docs/MAPA-DE-TELAS.md`
- `docs/ARQUITETURA.md`
- `docs/BANCO-DE-DADOS.md`
- `docs/PERMISSOES.md`
- `docs/DEPLOY.md`
- `docs/QA-CHECKLIST.md`

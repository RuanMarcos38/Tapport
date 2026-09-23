# Tapport

Tapport é um SaaS multiempresa para gestão portuária: operações de descarga, planejamento, balança, relatórios, cadastros, usuários, permissões e auditoria.

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
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_SECURE`: envio de e-mail transacional para recuperação de senha.
- `BOOTSTRAP_*`: criação controlada do tenant e administrador inicial de produção durante `pnpm db:seed`.

Para criar a primeira empresa em produção, defina pelo menos:

- `BOOTSTRAP_COMPANY_NAME`
- `BOOTSTRAP_COMPANY_SLUG`
- `BOOTSTRAP_ADMIN_NAME`
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`

O seed sempre aplica RBAC. Ele só cria empresa e usuários quando as variáveis acima estão preenchidas.

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

Healthcheck:

- `GET /api/health` valida runtime, conexão PostgreSQL e presença de configuração SMTP.

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

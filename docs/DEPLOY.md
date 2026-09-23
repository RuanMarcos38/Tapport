# Deploy

## Requisitos

- Node.js 20+.
- PostgreSQL 15+.
- Variáveis configuradas conforme `.env.example`.

## Build

```bash
pnpm install
pnpm db:migrate
pnpm build
```

## Produção

1. Criar banco PostgreSQL.
2. Definir `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL` e variáveis `SMTP_*`.
3. Executar migrations.
4. Definir `BOOTSTRAP_COMPANY_*` e `BOOTSTRAP_ADMIN_*` para criar o tenant inicial.
5. Rodar `pnpm build`.
6. Publicar em Vercel, Docker ou servidor Node.
7. Executar `pnpm db:seed` uma vez para aplicar RBAC e criar o primeiro administrador.

## Observações

- Nunca versionar `.env`.
- Usar conexão segura com SSL no banco de produção.
- Configurar backups e retenção.
- Validar `GET /api/health` após o deploy. O retorno esperado é `status: ok` e `database: ok`.
- `mail: configured` indica recuperação de senha com e-mail real configurado.

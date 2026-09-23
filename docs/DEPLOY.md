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
4. Executar seed inicial quando for ambiente demo.
5. Rodar `pnpm build`.
6. Publicar em Vercel, Docker ou servidor Node.

## Observações

- Nunca versionar `.env`.
- Usar conexão segura com SSL no banco de produção.
- Configurar backups e retenção.
- Validar `GET /api/health` após o deploy. O retorno esperado é `status: ok` e `database: ok`.
- `mail: configured` indica recuperação de senha com e-mail real configurado.

# QA Checklist

- [ ] Login com tenant/e-mail/senha.
- [ ] Logout.
- [ ] Recuperação de senha.
- [ ] Proteção de rotas.
- [ ] Dashboard com dados reais.
- [ ] Operações com busca/filtro/paginação.
- [ ] Cadastro de navio.
- [ ] Detalhe da operação.
- [ ] Planejamento.
- [ ] Registro de descarga.
- [ ] Balança.
- [ ] Acompanhamento.
- [ ] Cadastros CRUD.
- [ ] Usuários CRUD.
- [ ] Perfil e troca de senha.
- [ ] RBAC por papel.
- [ ] Super Admin isolado.
- [ ] Empresa A não acessa dados da Empresa B.
- [ ] Tentativa de manipular URL/ID não vaza dados.
- [ ] Audit logs gerados.
- [ ] Tabelas com loading, empty e error state.
- [ ] Responsivo desktop/notebook/tablet/mobile.
- [ ] Sem overflow horizontal acidental fora de tabelas controladas.
- [ ] Build de produção.
- [ ] Testes automatizados principais.

## Validação automatizada executada

- [x] `pnpm test` - 10 testes passaram.
- [x] `pnpm typecheck` - sem erros.
- [x] `pnpm build` - build de produção passou.
- [x] `prisma validate` - schema válido.

## Pendências de ambiente real

- [ ] Executar `pnpm db:migrate` e `pnpm db:seed` contra um PostgreSQL real.
- [ ] Validar manualmente login, CRUDs, permissões e isolamento Empresa A/B com dados persistidos no banco real.
- [ ] Executar comparação visual completa em navegador com o banco populado.

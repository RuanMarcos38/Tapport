# Auditoria PortLine

Data da auditoria: 22/09/2026  
Referência observada: `https://portline-demo.vercel.app/`  
Uso permitido: referência visual e funcional, sem cópia de código, tokens, cookies, APIs privadas ou credenciais.

## Identidade Visual Observada

- Layout SaaS operacional, denso e utilitário.
- Sidebar fixa desktop com fundo azul-marinho, largura aproximada de 256 px, marca no topo, links principais e bloco de usuário no rodapé.
- Header superior claro com marca textual, botão de tema e menu do usuário.
- Conteúdo em fundo cinza muito claro, cards brancos com bordas sutis, sombras leves e raio próximo de 8 px.
- Tipografia sem serifa, peso forte em indicadores e títulos, labels em caixa alta com espaçamento compacto.
- Cor primária visual: azul/ciano para seleção, progresso e realces; verde/amarelo/vermelho para estados operacionais.
- Mobile/tablet: sidebar recolhida em botão "Abrir menu"; drawer com mesma navegação.

## Navegação Principal

| Item | Rota | Descrição |
| --- | --- | --- |
| Dashboard | `/dashboard` | Sala de operação com KPIs, navio em destaque, progresso e séries por semana/mês. |
| Operações | `/operations` | Listagem de operações, filtros, busca e acesso às páginas de operação. |
| Cadastros | `/master-data` | Dados mestre por tipo: clientes, produtos, armazéns, destinos, transportadoras, porões, turnos, status, berços e placas. |
| Usuários | `/users` | Gestão de usuários e permissões por tenant. |
| Como Funciona | `/onboarding` | Página pública/educativa com hero e preview da operação. |
| Regras de Negócio | `/business-rules` | Catálogo filtrável de regras RN do domínio portuário. |
| Perfil | `/perfil` | Acesso via menu do usuário; edição de conta e senha. |
| Login | `/login` | Tela pública com tenant, e-mail, senha e seleção de janela de trabalho. |

## Login

Rota: `/login`

Componentes:
- Layout split com painel de marketing à esquerda e card de login à direita.
- Marca PortLine, selo de sistema online e métricas de confiança.
- Credenciais de demonstração exibidas como botões de preenchimento rápido.
- Segmento "Onde você trabalha": Escritório, Balança, Cliente.
- Campos: tenant/empresa, e-mail corporativo, senha, manter conectado.
- Botões: entrar no sistema, SSO corporativo, Microsoft.
- Link: solicitar acesso ao administrador.

Comportamentos:
- Seleção de perfil/janela antes do login.
- Botões de demo preenchem credenciais aparentes.
- Não foi encontrada tela de recuperação de senha na referência.

## Dashboard

Rota: `/dashboard`

Descrição:
- Tela inicial operacional, chamada "Sala de Operação".
- Mostra data/local, botão Atualizar e KPIs de alto nível.

Componentes:
- Cards: Operações ativas, Total descarregado, Registros hoje, Média t/hora.
- Cards de período: Hoje, Semana, Mês.
- Card principal "Navio no cais" com progresso, planejado, descarregado, saldo e caminhões.
- Bloco de ritmo e produto.
- Lista "Outras operações deste navio".
- Blocos "Semanas" e "Meses" com séries de toneladas/caminhões.
- Lista "Ainda no plano".

Dados observados:
- Operações ativas: 4.
- Total descarregado: 3.537,188 t de 116.527,000 t.
- Registro hoje: 0.
- Média t/hora: sem base.
- Navio principal: MV HORIZON.

Botões e ações:
- Atualizar: recarrega indicadores.
- Cards de navio/operação: levam à operação selecionada ou alteram o destaque.
- Menu de usuário e modo escuro no header.

Estados:
- Estado de carregamento observado em desktop 1920 antes dos dados renderizarem.
- Estado vazio parcial para "hoje" quando não há descarga no período.

Responsividade:
- Desktop: grid de quatro cards e duas colunas em blocos inferiores.
- Tablet/mobile: cards empilham; sidebar vira drawer.

## Operações

Rota: `/operations`

Componentes:
- Título "Operações" e subtítulo "Navios no pátio e histórico".
- Link/botão "Abrir navio".
- Campo de busca: "Buscar por navio..."
- Filtro de status: Todos os status.
- Tabela paginada.

Tabela:

| Coluna | Observação |
| --- | --- |
| Navio | Nome do navio. |
| Berço | Berço operacional. |
| Início | Data inicial. |
| Status | Ativa, Planejamento etc. |
| % Concluído | Barra/percentual. |
| Total Planejado (t) | Tonelagem planejada. |
| Total Descarregado (t) | Tonelagem já lançada. |
| Saldo (t) | Planejado menos descarregado. |

Paginação:
- Texto "Showing X of Y rows".
- Botões Previous/Next.
- seletor de página/tamanho com valor 10.

Comportamento:
- Clique em linha abre a operação em rota de detalhe.
- Em mobile a tabela mantém largura grande e exige rolagem horizontal.

## Abrir Operação

Rota: `/operations/nova`

Campos:
- Navio.
- Início da operação.
- Berço.
- Atracação.
- Término.
- Cliente.

Botões:
- Cancelar.
- Abrir e ir ao plano.

Observações:
- Formulário focado na abertura do navio; itens detalhados do plano entram depois na aba Plano.

## Detalhe da Operação

Rota base: `/operations/[id]`

Navegação interna:
- Capa.
- Ao vivo.
- Descarga.
- Plano.
- Relatórios.
- Rateio.
- CAR DIR.

Atalhos:
- Todas as operações.
- Abrir acompanhamento.
- Abrir balança.

### Capa

Rota: `/operations/[id]`

Componentes:
- Header com navio, status, código da operação, berço e terminal.
- Botão Play.
- KPIs: planejado, descarregado, saldo, caminhões.
- Progresso geral.
- Ritmo, ciclo médio, previsão de término.
- Último caminhão.
- Clima do pátio e previsão.
- Mapa dos porões.
- Resumo geral com filtros por período e data.
- Tabelas: produto, armazém, porão, DI.
- Gráfico/linha "Ritmo da descarga".
- Cards por turno.

Filtros:
- Período: Todos, Manhã, Tarde, Noite, Madrugada.
- Data inicial.
- Data final.

Tabelas da capa:
- Produto: Produto, Total, Retirado período, Retirado acumulado, Saldo.
- Armazém: Armazém, Total, Retirado período, Retirado acumulado, Saldo.
- Porão: Porão, Total, Retirado período, Retirado acumulado, Saldo.
- DI: DI, Total, Retirado período, Retirado acumulado, Saldo.

### Ao Vivo

Rota: `/operations/[id]/live`

Componentes:
- Sala em tempo real.
- Indicador "Ao vivo".
- Total de registros e última atualização.
- Último lançamento.
- Análise preditiva com data estimada, ritmo médio, saldo e dias restantes.
- Clima/local.
- Cards por terminal/armazém com caminhões, toneladas e último/próximo da balança.

### Descarga

Rota: `/operations/[id]/unloading`

Componentes:
- Último lançamento.
- Botão "Lançar no escritório".
- Tabela "Registros de Descarga".
- Botões de ordenação: Ordenar por Data, Ordenar por Di.

Tabela:
- Di, Data, Turno, Porão, Armazém, DI, Cliente, Produto, Peso Líquido (t), Placa, Ticket, Tempo Serviço (min).

### Plano

Rota: `/operations/[id]/planning`

Componentes:
- Botões Recalcular, Baixar PDF, Salvar Alterações.
- Matriz Produto x Armazém.
- Grade de Planejamento.
- Botão Adicionar Item.
- Filtros por Armazém, Cliente e Produto.

Tabelas:
- Matriz: Armazém, produto(s), Total.
- Grade: Seq, DI, Cliente, Produto, Quantidade (t), Situação, Armazém, Destino, Porões (t), Transportadora, Ações.

Observações:
- Texto instrui clicar no ícone para editar célula.
- Todos os campos são obrigatórios.
- Tonelada por porão só entra se o usuário digitar.

### Relatórios

Rota: `/operations/[id]/reports`

Componentes:
- Bloco "Documentos" com quatro documentos: Plano, Parcial, Completo, Detalhado.
- Cada documento possui botão "Baixar".
- KPIs: planejado, descarregado, saldo, conclusão.
- Relatório diário por dia/turno/porão.
- Legenda e regras de negócio.
- Rankings porões com mais volume e por turno.

Tabela:
- Item, H01, H02, TOTAL, DAY.

### Rateio

Rota: `/operations/[id]/rateio`

Componentes:
- Texto de encerramento por porão e recebedor/DI.
- Botão "Salvar campos manuais".
- Tabela de porões.
- Tabela de recebedores com campos manuais editáveis.

Tabelas:
- Porões: Porão, Planejado, Descarregado, Saldo.
- Recebedores: DI, Armazém, Manifestado, Parcial, Final, %, Segregada, Varredura lançada, A retirar (P), Rateio a retirar.

Campos:
- Inputs numéricos inline para final, segregada, a retirar e rateio.

### CAR DIR

Rota: `/operations/[id]/car-dir`

Componentes:
- Cruzamento DI x Produto x Transportadora x Destino.
- Filtros: DI, Produto, Transportadora, Destino.
- Botão Filtrar.
- Totais no rodapé.

Tabela:
- DI, Produto, Armazém, Transportadora, Destino, Plano, Descarga, Saldo, %.

## Acompanhamento

Rota: `/acompanhar/[id]`

Descrição:
- Tela operacional pública/compacta sem sidebar.
- Link Voltar.
- Progresso da descarga.
- Descarregado, planejado, saldo.
- Armazéns e DIs.
- Estado vazio "A descarga ainda não começou".
- Cards: ritmo, caminhões hoje, turno atual, término em, tempo.
- Evolução por dia.

Observação:
- Na operação auditada, a tela mostrou progresso zerado, apesar de existirem descargas no painel interno. Registrar como comportamento observado a confirmar.

## Balança

Rota: `/balanca/[id]`

Descrição:
- Tela dedicada ao operador de balança, sem shell principal.

Componentes:
- Header "PORTLINE · BALANÇA".
- Links Voltar à capa e Acompanhamento.
- Formulário "Lançar caminhão".
- Sugestões de DI/armazém.
- Campos opcionais expansíveis.
- Tabela de registros de descarga.
- Bloco fila da balança.
- Último lançamento e últimos do turno.

Campos obrigatórios:
- Sequência (Di).
- Porão.
- Data.
- Turno.
- Peso líquido (t).

Campos adicionais:
- DI textual.
- Varredura/sobras.
- Placa do caminhão.
- Número do ticket.
- Hora de entrada.
- Hora de saída.
- Observações.

Botões:
- Sugestões de DI/armazém.
- Dropdown de porão.
- Dropdown de turno.
- Campos Opcionais.
- Registrar descarga.
- Ordenar por Data.
- Ordenar por Di.

Responsividade:
- Em mobile, os campos e tabela mantiveram largura maior que o viewport. Tapport deve melhorar com rolagem horizontal controlada e inputs fluidos.

## Cadastros

Rota: `/master-data`

Abas:
- Clientes.
- Produtos.
- Armazéns.
- Destinos.
- Transportadoras.
- Porões.
- Turnos.
- Status.
- Berços.
- Placas.

Padrão por aba:
- Busca: "Buscar [tipo]..."
- Botão "Novo [tipo]".
- Tabela Nome, Código, Status, Ações.
- Paginação.
- Cards-resumo inferiores.

Criação:
- O botão "Novo" insere formulário inline no topo da listagem.
- Campos: Nome e Código opcional.
- Botão Salvar fica desabilitado até preencher dados mínimos.

Edição:
- Primeiro ícone de ação abre edição inline na linha.
- Campos editáveis: Nome e Código.

Exclusão/desativação:
- Segundo ícone aparenta ação destrutiva/remover. Não foi acionado por segurança.

Dados auditados por aba:
- Clientes: 14 registros.
- Produtos: 20 registros exibidos.
- Armazéns: 20 registros exibidos.
- Destinos: 19 registros.
- Transportadoras: 20 registros exibidos.
- Porões: 10 registros.
- Turnos: 9 registros.
- Status: 4 registros.
- Berços: 10 registros.
- Placas: 20 registros exibidos.

## Usuários

Rota: `/users`

Componentes:
- Cards-resumo: Total Usuários, Administradores, Operadores, Inativos.
- Busca por nome/e-mail.
- Botão Adicionar Usuário.
- Tabela de usuários.

Tabela:
- Nome, E-mail, Papel, Último Login, Status, Ações.

Ações:
- Editar.
- Desativar.
- Excluir.
- O próprio usuário mostra "Editar meu perfil".

Adicionar Usuário:
- Modal.
- Campos: Nome, E-mail, Senha, Papel, Ativo.
- Botões/ações: mostrar senha, gerar senha automática, cancelar, criar usuário.
- Papéis: Administrador, Gerente, Operador, Visualizador.

Editar Usuário:
- Modal.
- Campos: Nome, Papel, Ativo.
- Botões: Cancelar, Salvar.
- Aviso: troca de senha é feita pelo próprio usuário mediante senha atual.

Estados:
- Ao entrar, foi observado "Carregando usuários..." por alguns segundos antes da tabela aparecer.

## Perfil

Rota: `/perfil`

Componentes:
- Dados da conta no tenant.
- Campo Nome editável.
- E-mail e papel exibidos.
- Seção "Trocar senha".

Campos:
- Nome.
- Senha atual.
- Nova senha.
- Confirmar nova senha.

Botão:
- Salvar.

## Regras de Negócio

Rota: `/business-rules`

Componentes:
- Cards: Total de Regras, Implementadas, Parciais, Planejadas, Cobertura.
- Busca por código, título ou descrição.
- Filtros: Todas, Implementadas, Parciais, Planejadas.
- Grupos expansíveis/selecionáveis por domínio.

Domínios:
- Cadastros.
- Operações.
- Planejamento.
- Registro de Descarga.
- Cálculos.
- Exibição e Interface.
- Permissões.
- Integridade e Auditoria.
- Validação de Dados.
- Formatação Condicional.

Regras importantes observadas:
- Unicidade por tenant.
- Soft delete/desativação.
- Ciclo de vida de operação.
- Planejamento com campos obrigatórios.
- Registro de descarga apenas em operação ativa.
- Unicidade de ticket por operação.
- Cálculos de saldo, percentual, resumos, rateio e CAR DIR.
- RBAC com Admin, Manager, Operator e Viewer.
- Auditoria e `createdBy`, `createdAt`, `updatedAt`.

## Como Funciona

Rota: `/onboarding`

Descrição:
- Página pública com hero "Da balança para a capa do navio".
- Preview da operação MV HORIZON.
- Links para entrar na demo/abrir Horizon.

## Página Pública Inicial

Rota: `/`

Descrição:
- Landing narrativa: navio no berço, balança e sala.
- CTAs para login/entrar na operação.
- Preview de capa da operação.

## Permissões Aparentes

- Administrador: acesso a dashboard, operações, cadastros, usuários e perfil.
- Gerente: inferido por login demo, acesso amplo.
- Operador: focado em balança/descarga.
- Visualizador: acesso de cliente/leitura.
- Super Admin SaaS não foi observado na referência, mas será implementado no Tapport por requisito do projeto.

## Estados e Comportamentos Gerais

- Loading em dashboard e usuários.
- Empty state em acompanhamento e períodos sem descarga.
- Tabelas com paginação, busca e filtros.
- Edição inline em cadastros e planejamento.
- Modais em usuários.
- Telas operacionais especiais sem sidebar: acompanhamento e balança.
- Tema escuro via botão no header.
- Menu do usuário com Perfil, Equipe e Sair.

## Pontos Não Determinados Sem Ação Destrutiva

- Confirmação e comportamento real de exclusão/desativação em usuários e cadastros.
- Validações finais de submissão nos formulários de criação, pois não foram enviados dados à referência.
- Resultado real dos downloads PDF, pois baixar documentos foi evitado durante a auditoria.
- SSO corporativo/Microsoft na referência.


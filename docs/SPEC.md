# CifraInk — Plano de execução

Checklist executável do projeto. Uma tarefa só recebe `[x]` depois de implementada e verificada conforme `AGENTS.md`.

- Escopo e decisões: [`SCOPE.md`](SCOPE.md)
- Regras de contribuição: [`../AGENTS.md`](../AGENTS.md)

## Legenda

- `[x]` concluído e revisado.
- `[ ]` não iniciado, em andamento ou ainda não verificado.
- As etapas seguem ordem recomendada; uma tarefa pode depender das anteriores.

## 1. Fundação do repositório

### 1.1 Scaffold

- [x] Inicializar o projeto WXT com React e TypeScript usando pnpm.
- [x] Confirmar que o projeto gera uma extensão Manifest V3 válida.
- [x] Ativar as opções estritas recomendadas do TypeScript.
- [x] Configurar aliases somente se reduzirem imports repetitivos reais.
- [x] Criar `.gitignore` adequado para WXT, Node, artefatos e arquivos locais.
- [x] Adicionar metadados iniciais do CifraInk ao manifesto.
- [x] Integrar o ícone oficial original e gerar os tamanhos exigidos pelo manifesto.
- [x] Confirmar que nenhuma dependência ou asset do legado foi copiado.

### 1.2 Scripts e qualidade

- [x] Configurar Biome para lint e formatação.
- [x] Configurar Vitest com ambiente jsdom.
- [x] Configurar React Testing Library.
- [x] Adicionar scripts `dev`, `build`, `typecheck`, `lint`, `test`, `test:e2e` e `check`.
- [x] Garantir que `pnpm check` execute typecheck, lint e testes unitários.
- [x] Fixar dependências no lockfile.
- [x] Executar e registrar o primeiro build limpo.

Validação de 2026-08-25: `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm test:e2e`
e `pnpm build` concluídos com sucesso.

### 1.3 Integração contínua

- [x] Criar workflow do GitHub Actions com pnpm e cache.
- [x] Instalar dependências com lockfile imutável no CI.
- [x] Executar `pnpm check` no CI.
- [x] Executar `pnpm build` no CI.
- [x] Salvar o pacote da extensão como artefato do workflow quando apropriado.

Validação de 2026-08-25: workflow aprovado pelo `actionlint`; instalação imutável, checks,
build e conteúdo do artefato validados localmente.

## 2. Contrato com o DOM do Cifra Club

### 2.1 Fixtures

- [x] Criar fixture sanitizada representando uma página completa.
- [x] Criar fixture sem compositor.
- [x] Criar fixture sem diagramas.
- [x] Remover letras completas, scripts, anúncios e dados desnecessários das fixtures.
- [x] Preservar apenas a estrutura necessária para os testes de compatibilidade.
- [x] Documentar como atualizar uma fixture quando o site mudar.

Validação de 2026-08-25: três fixtures aprovadas pelo `html-validate`; integridade,
sanitização, `pnpm check` e `pnpm build` validados localmente.

### 2.2 Seletores e capacidades

- [x] Criar `src/cifraclub/selectors.ts`.
- [x] Priorizar atributos semânticos e relações estruturais.
- [x] Documentar seletores baseados em texto ou classes geradas.
- [x] Criar o tipo `PageCapabilities`.
- [x] Implementar detecção de página compatível, parcial e incompatível.
- [x] Distinguir elementos obrigatórios de opcionais.
- [x] Garantir que a ausência de um elemento opcional não lance exceção.

Validação de 2026-08-25: seletores e estados cobertos por testes; fixtures aprovadas pelo
`html-validate`; `pnpm check` e `pnpm build` concluídos com sucesso.

### 2.3 `CifraClubPage`

- [x] Criar `src/cifraclub/page.ts` sem dependência de React.
- [x] Implementar localização do título.
- [x] Implementar localização do artista.
- [x] Implementar localização do compositor opcional.
- [x] Implementar localização do conteúdo musical principal.
- [x] Implementar localização da seção de diagramas.
- [x] Implementar localização individual dos diagramas.
- [x] Implementar localização de elementos de marca opcionais.
- [x] Implementar `inspect()` com diagnóstico legível pela interface.
- [x] Manter o adaptador somente leitura.

Validação de 2026-08-25: adaptador e casos de ausência cobertos por testes; isolamento da
raiz e comportamento somente leitura verificados; `pnpm check` e `pnpm build` concluídos.

### 2.4 Testes do adaptador

- [x] Testar página completa compatível.
- [x] Testar página sem compositor.
- [x] Testar página sem diagramas.
- [x] Testar documento sem conteúdo musical como incompatível.
- [x] Testar chamadas repetidas do adaptador.
- [x] Testar que componentes fora do escopo não são retornados como conteúdo musical.

Validação de 2026-08-25: sete cenários do adaptador aprovados, incluindo chamadas repetidas,
atualização após mudança do DOM e isolamento da raiz; `pnpm check` e `pnpm build` concluídos.

## 3. Alterações reversíveis do DOM

### 3.1 Snapshot

- [x] Criar os tipos de snapshot em `src/dom/snapshot.ts`.
- [x] Capturar texto original apenas quando ele for alterado.
- [x] Capturar atributos originais apenas quando forem alterados.
- [x] Capturar propriedades de estilo originais apenas quando forem alteradas.
- [x] Usar `Map<Element, Snapshot>` como registro enumerável da sessão.
- [x] Garantir que a segunda alteração não substitua o valor original capturado.
- [x] Expor limpeza individual e total para restauração e desmontagem da extensão.

Validação de 2026-08-25: sete cenários de captura e limpeza aprovados; primeira captura,
atributos ausentes, estilos e prioridade preservados; `pnpm check` e `pnpm build` concluídos.

### 3.2 Operações

- [x] Implementar `setText` usando `textContent`.
- [x] Implementar `setVisible` sem presumir o display original.
- [x] Implementar `setEditable` preservando o atributo anterior.
- [x] Implementar `setStyles` alterando somente propriedades declaradas.
- [x] Implementar `restore(element)`.
- [x] Implementar `restoreAll()`.
- [x] Tornar mutações e restaurações idempotentes.
- [x] Não marcar elementos existentes do site com `data-cifraink`.

Validação de 2026-08-25: oito cenários de mutação e restauração aprovados; atributos e estilos
originais preservados; `pnpm check` e `pnpm build` concluídos com sucesso.

### 3.3 Testes das operações

- [x] Testar alteração e restauração de texto.
- [x] Testar alteração e restauração de visibilidade.
- [x] Testar alteração e restauração de `contenteditable`.
- [x] Testar múltiplas propriedades de estilo.
- [x] Testar duas alterações consecutivas no mesmo elemento.
- [x] Testar `restore()` repetido.
- [x] Testar `restoreAll()` repetido.
- [x] Testar limpeza dos snapshots após restauração.
- [x] Testar elementos removidos pelo próprio site antes da restauração.

Validação de 2026-08-25: nove cenários das operações aprovados, incluindo novas sessões,
limpeza observável e elementos desconectados; `pnpm check` e `pnpm build` concluídos.

## 4. Content script e ciclo de vida

### 4.1 Registro

- [ ] Criar o entrypoint `cifraclub.content`.
- [ ] Restringir o match às URLs de impressão suportadas.
- [ ] Executar no mundo isolado padrão.
- [ ] Inicializar sem service worker ou eventos globais de abas.
- [ ] Não solicitar `tabs`, `activeTab` ou `scripting`.

### 4.2 Inicialização

- [ ] Inspecionar capacidades antes de montar controles.
- [ ] Montar uma única instância do host do painel.
- [ ] Marcar o host criado pela extensão com `data-cifraink`.
- [ ] Impedir duplicação após chamadas repetidas.
- [ ] Desmontar listeners, React root e snapshots corretamente.
- [ ] Preservar a página original quando a inicialização falhar.
- [ ] Exibir estado incompatível sem detalhes internos.

### 4.3 Reatividade do site

- [ ] Testar manualmente mudanças de tamanho do texto.
- [ ] Testar alternância entre uma e duas colunas.
- [ ] Testar mudança de tom.
- [ ] Testar alteração da posição dos diagramas.
- [ ] Registrar quais controles recriam elementos do DOM.
- [ ] Reanexar edição e controles somente quando necessário.
- [ ] Adicionar `MutationObserver` apenas se os testes anteriores demonstrarem necessidade.
- [ ] Se adicionado, testar debounce, desconexão e ausência de ciclos.

## 5. Painel do CifraInk

### 5.1 Fundação visual

- [ ] Criar Shadow Root UI com a API do WXT.
- [ ] Criar `Panel.tsx` e `panel.css`.
- [ ] Definir custom properties mínimas para cor, espaço, tipografia e borda.
- [ ] Criar painel flutuante que não altere a largura do documento impresso.
- [ ] Implementar abrir e recolher.
- [ ] Esconder o painel durante a impressão.
- [ ] Garantir foco visível e navegação por teclado.
- [ ] Garantir contraste adequado dos controles.

### 5.2 Componentes pequenos

- [ ] Criar componente de seção do painel.
- [ ] Criar controle de visibilidade com label associado.
- [ ] Criar status de compatibilidade.
- [ ] Criar botão **Restaurar página**.
- [ ] Evitar biblioteca externa de componentes e ícones no MVP.

### 5.3 Estado do painel

- [ ] Modelar apenas capacidades, valores visíveis e estado aberto/recolhido.
- [ ] Usar `useState` para estados independentes.
- [ ] Introduzir `useReducer` somente se as transições compartilhadas justificarem.
- [ ] Sincronizar controles com o estado real do DOM ao montar.
- [ ] Atualizar o controle quando uma ação nativa alterar o alvo relacionado.

## 6. Funcionalidades do MVP

### 6.1 Cabeçalho

- [ ] Editar título.
- [ ] Editar artista.
- [ ] Editar compositor quando presente.
- [ ] Mostrar ou ocultar título.
- [ ] Mostrar ou ocultar artista.
- [ ] Mostrar ou ocultar compositor.
- [ ] Mostrar ou ocultar elemento de marca quando localizado com segurança.
- [ ] Implementar cabeçalho compacto com estilos próprios mínimos.
- [ ] Restaurar textos, visibilidade e estilos do cabeçalho.
- [ ] Ocultar controles de campos ausentes.

### 6.2 Conteúdo musical

- [ ] Ativar edição do contêiner musical reconhecido.
- [ ] Desativar edição restaurando o atributo anterior.
- [ ] Preservar `white-space`, fonte e quebras de linha.
- [ ] Impedir que o painel ou controles laterais se tornem editáveis.
- [ ] Confirmar funcionamento do undo/redo nativo enquanto o conteúdo está focado.
- [ ] Restaurar o texto original da sessão.
- [ ] Confirmar que imprimir não inclui indicadores visuais de edição.

### 6.3 Diagramas

- [ ] Mostrar ou ocultar a seção completa.
- [ ] Listar diagramas encontrados pelo nome visível.
- [ ] Mostrar ou ocultar cada diagrama.
- [ ] Implementar espaçamento compacto sem sobrescrever estilos não relacionados.
- [ ] Restaurar a seção e cada diagrama.
- [ ] Tratar nomes repetidos sem usar o texto como ID único.
- [ ] Tratar ausência total de diagramas sem erro.

### 6.4 Integração com impressão

- [ ] Confirmar que o painel não aparece em `@media print`.
- [ ] Confirmar que o botão nativo de impressão continua funcionando.
- [ ] Confirmar que as alterações visíveis aparecem na impressão/PDF.
- [ ] Confirmar que restaurar antes de imprimir devolve o resultado original.
- [ ] Não interceptar, substituir ou disparar automaticamente a impressão.

## 7. Preferências globais

### 7.1 Modelo e armazenamento

- [ ] Criar tipo versionado de preferências.
- [ ] Definir valores padrão.
- [ ] Implementar validação manual do objeto armazenado.
- [ ] Ler preferências via WXT Storage.
- [ ] Salvar painel aberto/recolhido.
- [ ] Salvar preferência de cabeçalho compacto.
- [ ] Salvar preferência de diagramas compactos.
- [ ] Salvar visibilidades padrão suportadas.
- [ ] Ignorar campos desconhecidos ou inválidos com segurança.
- [ ] Não armazenar conteúdo da música ou HTML da página.

### 7.2 Aplicação

- [ ] Aplicar preferências somente após inspeção compatível.
- [ ] Não aplicar preferência de um recurso ausente.
- [ ] Capturar o estado original antes de aplicar uma preferência.
- [ ] Permitir restaurar a página sem apagar preferências globais.
- [ ] Oferecer ação separada para restaurar preferências padrão, se necessária.

### 7.3 Testes

- [ ] Testar ausência de preferências salvas.
- [ ] Testar preferências válidas.
- [ ] Testar versão desconhecida.
- [ ] Testar tipos e valores inválidos.
- [ ] Testar que nenhum conteúdo musical é persistido.

## 8. Robustez e compatibilidade

- [ ] Validar página compatível sem compositor.
- [ ] Validar página compatível sem diagramas.
- [ ] Validar cifra com várias páginas.
- [ ] Validar cifra com duas colunas.
- [ ] Validar cifra com tablatura.
- [ ] Validar cifra com nomes de acordes repetidos e especiais.
- [ ] Validar reinicialização do content script sem painel duplicado.
- [ ] Validar restauração após mudanças feitas pelos controles nativos.
- [ ] Validar que falha de um seletor não desabilita recursos independentes.
- [ ] Validar que nenhum erro não tratado aparece no console.
- [ ] Validar que nenhuma alteração permanece após desmontagem/restauração.
- [ ] Documentar procedimento de atualização dos seletores.

## 9. E2E e revisão visual

### 9.1 Automação

- [ ] Configurar Playwright para carregar a extensão no Chromium.
- [ ] Criar fluxo E2E de inicialização e painel único.
- [ ] Criar fluxo E2E de edição do cabeçalho e conteúdo.
- [ ] Criar fluxo E2E de ocultação e compactação dos diagramas.
- [ ] Criar fluxo E2E de restauração completa.
- [ ] Criar fluxo E2E com controles nativos de texto e colunas.

### 9.2 Verificação visual

- [ ] Revisar painel aberto e recolhido em viewport comum.
- [ ] Revisar foco, hover, disabled e incompatibilidade parcial.
- [ ] Revisar página longa com o painel fixo.
- [ ] Revisar impressão A4 de múltiplas páginas.
- [ ] Comparar screenshot antes, alterado e restaurado.
- [ ] Confirmar ausência do painel e indicadores de edição no PDF.

### 9.3 Acessibilidade

- [ ] Percorrer todo o painel somente com teclado.
- [ ] Confirmar associação entre labels e controles.
- [ ] Confirmar ordem de foco previsível.
- [ ] Confirmar nomes acessíveis para botões sem texto visível.
- [ ] Confirmar contraste e foco visível.

## 10. Segurança, privacidade e permissões

- [ ] Revisar manifesto final e justificar cada permissão.
- [ ] Confirmar ausência de `tabs`, `activeTab` e `scripting`.
- [ ] Confirmar ausência de código remoto, `eval` e `innerHTML` editável.
- [ ] Confirmar que a extensão não lê cookies ou dados de conta.
- [ ] Confirmar que nenhum conteúdo ou identificador é enviado pela rede.
- [ ] Confirmar ausência de analytics no MVP.
- [ ] Criar uma declaração curta de privacidade coerente com o comportamento real.
- [ ] Revisar dependências e licenças antes da distribuição.

## 11. Documentação e distribuição

- [ ] Criar `README.md` com objetivo, recursos e instalação para desenvolvimento.
- [ ] Documentar comandos e fluxo de testes.
- [ ] Documentar como carregar a extensão descompactada no Chrome.
- [ ] Documentar limitações conhecidas e página suportada.
- [x] Integrar o ícone oficial e seus arquivos derivados.
- [ ] Definir a identidade visual complementar para painel e materiais de publicação.
- [ ] Revisar nome, descrição, versão e URLs do manifesto.
- [ ] Gerar build de produção limpo.
- [ ] Gerar pacote `.zip` reprodutível.
- [ ] Instalar o pacote final em um perfil limpo do Chrome.
- [ ] Executar checklist manual completo no pacote final.
- [ ] Preparar textos e imagens para a Chrome Web Store.
- [ ] Registrar procedimento de release e atualização rápida de compatibilidade.

## 12. Gate de conclusão do MVP

- [ ] Todos os critérios de aceite de `docs/SCOPE.md` estão comprovados.
- [ ] `pnpm check` passa em ambiente limpo.
- [ ] `pnpm build` passa em ambiente limpo.
- [ ] Fluxos E2E essenciais passam ou possuem checklist manual aprovado.
- [ ] Não existem erros não tratados no console da página ou da extensão.
- [ ] Restauração completa foi verificada visualmente.
- [ ] Impressão/PDF foi verificada em uma cifra de múltiplas páginas.
- [ ] Permissões, privacidade e dependências foram revisadas.
- [ ] `README.md`, `AGENTS.md`, `docs/SCOPE.md` e `docs/SPEC.md` refletem o produto entregue.
- [ ] O pacote instalável foi testado em um perfil limpo.

## 13. Backlog pós-MVP

### Funções preservadas do legado

- [ ] Avaliar persistência de rascunhos por música.
- [ ] Avaliar renomear acordes nos diagramas.
- [ ] Avaliar anotações nos diagramas.
- [ ] Avaliar mostrar ou ocultar posições internas do acorde.
- [ ] Avaliar reordenação de diagramas.
- [ ] Avaliar posicionamento de diagramas por página.
- [ ] Avaliar popup com status e instruções úteis.

### Evoluções próprias

- [ ] Avaliar quebras de página manuais.
- [ ] Avaliar presets de impressão.
- [ ] Avaliar suporte a outros sites por adaptadores separados.
- [ ] Avaliar Firefox somente após estabilizar o MVP no Chrome.
- [ ] Avaliar internacionalização somente após existir demanda.

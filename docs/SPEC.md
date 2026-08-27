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

### 2.5 Drift do wrapper de impressão

- [x] Atualizar as fixtures sanitizadas com o wrapper intermediário observado na página real.
- [x] Adaptar a localização de páginas sem ampliar consultas para fora da raiz de impressão.
- [x] Corrigir a localização da seção de diagramas para a hierarquia atual.
- [x] Cobrir a hierarquia real e a ausência do wrapper sem usar classes geradas.
- [x] Revalidar `inspect()` na página real antes de iniciar os controles do painel.

Validação de 2026-08-25: wrapper intermediário e hierarquia direta cobertos, páginas e diagramas
limitados à raiz reconhecida e fixtures sanitizadas atualizadas. No Chrome, `inspect()` reconheceu a
página real como compatível, com quatro blocos musicais e o painel montado inline.

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

- [x] Criar o entrypoint `cifraclub.content`.
- [x] Restringir o match às URLs de impressão suportadas.
- [x] Executar no mundo isolado padrão.
- [x] Inicializar sem service worker ou eventos globais de abas.
- [x] Não solicitar `tabs`, `activeTab` ou `scripting`.

Validação de 2026-08-25: contrato-fonte e manifesto MV3 gerado aprovados; content script estático,
mundo isolado, match restrito e ausência de permissões explícitas; `pnpm check` e `pnpm build`
concluídos.

### 4.2 Inicialização

- [x] Inspecionar capacidades antes de montar controles.
- [x] Montar uma única instância do host do painel.
- [x] Marcar o host criado pela extensão com `data-cifraink`.
- [x] Impedir duplicação após chamadas repetidas.
- [x] Desmontar listeners, React root e snapshots corretamente.
- [x] Preservar a página original quando a inicialização falhar.
- [x] Exibir estado incompatível sem detalhes internos.

Validação de 2026-08-25: estados compatível, parcial e incompatível aprovados; host único,
inicialização concorrente, invalidação e falhas de montagem cobertos; `pnpm check` e `pnpm build`
concluídos.

### 4.3 Reatividade do site

- [x] Testar manualmente mudanças de tamanho do texto.
- [x] Testar alternância entre uma e duas colunas.
- [x] Testar mudança de tom.
- [x] Testar alteração da posição dos diagramas.
- [x] Registrar quais controles recriam elementos do DOM.
- [x] Documentar a decisão de não antecipar infraestrutura reativa.

Validação de 2026-08-25: baseline real registrada em `docs/DOM_REACTIVITY.md`; tamanho do texto,
colunas, tom e posição dos diagramas exercitados e restaurados; raiz e cabeçalho permaneceram
estáveis, enquanto páginas, acordes ou diagramas foram recriados conforme o controle. A integração
reativa foi transferida para a fase 7, depois dos recursos do MVP.

### 4.4 Inicialização após hidratação

- [x] Aguardar `window.load` quando o documento ainda não estiver completo.
- [x] Aguardar uma oportunidade ociosa com limite de 500 ms antes de consultar ou modificar o DOM.
- [x] Compartilhar a espera entre inicializações concorrentes e revalidar a existência do host.
- [x] Cancelar a espera com segurança quando o contexto WXT for invalidado.
- [x] Reconsultar página e controles nativos somente após a estabilização inicial.
- [x] Preservar a página e emitir aviso local sanitizado quando a montagem falhar.
- [x] Validar cinco navegações novas no Chrome sem recarregar e sem erro React `#418`.

Validação de 2026-08-27: carregamento, oportunidade ociosa, documento já completo,
inicialização concorrente, invalidação, reconsulta do DOM e falhas de montagem cobertos por testes.
No Chrome, cinco navegações novas e um recarregamento mantiveram exatamente um host inline conectado
por mais de três segundos, sem novas ocorrências do erro React `#418`. Não foram adicionados observer,
tentativas, dependências, permissões ou seletores internos do site.

## 5. Painel do CifraInk

### 5.1 Fundação visual

- [x] Criar Shadow Root UI com a API do WXT.
- [x] Evoluir `Panel.tsx` e criar `panel.css`.
- [x] Mapear a linguagem visual observável dos controles nativos sem copiar CSS, classes ou assets.
- [x] Definir custom properties próprias para cor, espaço, tipografia, borda, raio e sombra.
- [x] Reproduzir a densidade, as superfícies neutras e a hierarquia compacta do painel nativo.
- [x] Usar a identidade do CifraInk como destaque contido, sem competir com a cifra.
- [x] Manter o painel reconhecível como extensão, sem sugerir recurso oficial do Cifra Club.
- [x] Não depender de estilos herdados da página fora do Shadow DOM.
- [x] Integrar o painel à coluna nativa, com fallback flutuante que não altera a impressão.
- [x] Localizar o agrupador nativo por relação estrutural, sem classes geradas.
- [x] Usar no bloco inline borda, raio e ausência de sombra coerentes com os blocos nativos.
- [x] Manter ações globais fora dos blocos, com dimensões e estados coerentes com os botões nativos.
- [x] Auditar o modelo nativo e usar Hugeicons Free quando o sprite não for reutilizável.
- [x] Implementar abrir e recolher.
- [x] Esconder o painel durante a impressão.
- [x] Implementar estados coerentes de hover, foco, pressionado e desabilitado.
- [x] Garantir foco visível e navegação por teclado sem divergir da linguagem visual adotada.
- [x] Garantir contraste adequado dos controles.
- [x] Executar smoke visual da montagem inline e do fallback responsivo no Chrome.
- [x] Tornar o ícone do painel acessível ao content script no manifesto gerado.
- [x] Preservar os cliques do painel nas montagens inline e flutuante.

Validação automatizada de 2026-08-25: montagem inline no agrupador `aside > div`, fallback overlay,
painel aberto e recolhido, marca oficial, estados de compatibilidade e atributos acessíveis cobertos;
CSS isolado gerado sem entrada `css` no content script do manifesto; 67 testes, `pnpm check` e
`pnpm build` aprovados. Smoke concluído no Chrome em 2026-08-26: montagem inline em viewport comum e
fallback flutuante iniciado diretamente em 360 px, sem overflow horizontal ou perda de interação.

### 5.2 Componentes pequenos

- [x] Criar componente de seção do painel.
- [x] Criar controle de visibilidade com label associado.
- [x] Criar status de compatibilidade.
- [x] Criar botão **Restaurar página**.
- [x] Usar controles HTML nativos e a anatomia familiar de rótulo, valor, alternância e ação.
- [x] Preparar o agrupamento dos recursos sem renderizar controles indisponíveis antes da fase 6.
- [x] Evitar biblioteca externa de componentes e limitar ícones ao Hugeicons Free aprovado.
- [x] Importar individualmente somente os ícones funcionais usados no painel.

Validação de 2026-08-25: componentes semânticos de seção, visibilidade, status e restauração
aprovados; o painel integra somente status e restauração funcional, deixando os grupos da fase 6
fora da interface até possuírem comportamento real. Hugeicons Free foi limitado aos ícones de ação,
com imports nomeados e sem assets remotos. Foram aprovados `pnpm install --frozen-lockfile`, 67 testes,
`pnpm check`, `pnpm build`, manifesto MV3 e `git diff --check`; o smoke visual final depende do
recarregamento da extensão no Chrome.

### 5.3 Estado do painel

- [x] Modelar somente capacidades externas e o estado visual aberto/recolhido já utilizado.
- [x] Usar `useState` para o estado local independente.
- [x] Derivar mensagens, nomes, ícones e visibilidades sem duplicar estado.
- [x] Manter capacidades como propriedades imutáveis, sem sincronização artificial por efeito.
- [x] Não introduzir `useReducer` antes de existirem transições compartilhadas que o justifiquem.

Validação de 2026-08-25: compatibilidade derivada das propriedades, estado recolhido preservado em
rerender, nova montagem aberta e restauração independente do estado visual cobertos por testes. A
sincronização inicial dos controles permanece na fase 6 e a revalidação após ações nativas na fase 7.
Foram aprovados os testes isolados do painel e ciclo de vida, 69 testes em `pnpm check`, `pnpm build`
e `git diff --check`.

### 5.4 Integração visual nativa

- [x] Organizar os controles em dois blocos sem títulos visíveis, preservando regiões nomeadas.
- [x] Padronizar dimensões, densidade, separadores, labels, valores e switches conforme a gramática
  visual observada nos controles nativos.
- [x] Transformar título, artista e compositor em linhas compactas com editores laterais.
- [x] Transformar a lista individual de diagramas em seletor lateral rolável com contagem visível.
- [x] Usar Popover API e CSS Anchor Positioning com abertura exclusiva, light dismiss, Escape,
  gestão de foco e fallback responsivo.
- [x] Integrar o status ao cabeçalho, exibindo aviso textual somente para estados problemáticos.
- [x] Aplicar os Hugeicons semânticos aprovados, sem reutilizar o sprite remoto do site.
- [x] Fechar popovers durante restauração e recolhimento do painel.
- [x] Revalidar painel, ciclo de vida, restauração e ausência de regressões no manifesto.
- [x] Executar smoke no Chrome em montagem inline, viewport de 360 px e impressão.

Auditoria de 2026-08-26: estrutura semântica, composição em dois blocos, linhas compactas, editores,
seletor rolável de diagramas, status, Hugeicons e fechamento dos popovers foram confirmados no código
e nos testes. O smoke no Chrome confirmou montagem inline, abertura exclusiva, fechamento por Escape,
foco inicial, scroll interno, recolhimento e restauração visual do painel. A auditoria identificou e
corrigiu o retorno de foco ao acionador após Escape, com teste de regressão. Foram aprovados 118 testes,
`pnpm check`, `pnpm build`, manifesto MV3 sem permissões explícitas e `git diff --check`.

Smoke concluído no Chrome em 2026-08-26: na inicialização direta em 360 px, o host foi montado no
`body`, o painel ocupou 336 px com margens laterais de 12 px e não criou overflow horizontal. Editores
e diagramas permaneceram dentro da viewport; foco inicial, retorno por Escape, light dismiss, scroll
interno, recolhimento e reabertura foram aprovados. Em viewport comum, a montagem inline voltou ao
agrupador nativo. A impressão foi aprovada na 6.4.

Ajuste visual de 2026-08-27: a distância entre acionador e dropdown foi medida em 8 px no controle
nativo e 4 px no CifraInk. Popovers laterais e seu fallback inferior passaram a usar os mesmos 8 px,
sem alterar dimensões, alinhamento ou comportamento.

O redimensionamento de uma página já aberta ainda faz o Cifra Club recriar o agrupador responsivo e
remover o host inline. A recuperação após essa recriação permanece corretamente atribuída à fase 7 e
não altera a aprovação do fallback durante a inicialização.

## 6. Funcionalidades do MVP

- [x] Inicializar cada controle funcional com o valor real do DOM, sem assumir valores padrão.

### 6.1 Cabeçalho

- [x] Editar título.
- [x] Editar artista.
- [x] Editar compositor quando presente.
- [x] Mostrar ou ocultar título.
- [x] Mostrar ou ocultar artista.
- [x] Mostrar ou ocultar compositor.
- [x] Mostrar ou ocultar elemento de marca quando localizado com segurança.
- [x] Implementar cabeçalho compacto com estilos próprios mínimos.
- [x] Restaurar textos, visibilidade e estilos do cabeçalho.
- [x] Ocultar controles de campos ausentes.
- [x] Executar smoke na página real após concluir o drift estrutural da 2.5 e recarregar a extensão.

Validação automatizada de 2026-08-25: valores iniciais lidos do DOM, edição imediata, prefixo do
compositor, visibilidade individual, marca e campos ausentes, compactação seletiva e restauração
integral cobertos. No smoke real, edição, compactação e restauração exata foram aprovadas, mas o CSS
do site manteve compositor e marca visíveis apesar de `hidden`. A correção usa uma sobrescrita
reversível de `display`, possui teste dedicado e aguarda revalidação após recarregar a extensão.

Correção de 2026-08-26: a releitura do compositor passou a remover apenas o prefixo estrutural e seu
separador, preservando espaços finais e consecutivos durante a digitação. O caso possui teste de
regressão e foi aprovado com 119 testes em `pnpm check` e `pnpm build`.

Correção de 2026-08-27: título e artista passaram a ocultar seus links contêineres, e o cabeçalho
completo é ocultado quando nenhum dos quatro recursos permanece visível. A mudança remove itens flex
e margem externa residuais sem apagar, mover ou recriar elementos do site.

### 6.2 Conteúdo musical

- [x] Ativar edição do contêiner musical reconhecido.
- [x] Desativar edição restaurando o atributo anterior.
- [x] Preservar `white-space`, fonte e quebras de linha.
- [x] Impedir que o painel ou controles laterais se tornem editáveis.
- [x] Confirmar funcionamento do undo/redo nativo enquanto o conteúdo está focado.
- [x] Restaurar o texto e a estrutura originais da sessão.
- [x] Não adicionar indicadores visuais ou estilos próprios de edição.

Validação automatizada de 2026-08-25: múltiplos blocos, ausência de conteúdo, atributos anteriores,
`plaintext-only`, captura estrutural única, restauração seletiva e integral, referências preservadas
quando não há edição, elementos desconectados e integração do painel cobertos. Foram aprovados 101
testes em `pnpm check`, `pnpm build`, manifesto MV3 sem permissões explícitas e
`git diff --check`. No smoke real de 2026-08-25, os quatro blocos receberam `plaintext-only` sem
alterar fonte ou `white-space`; undo/redo nativo, desativação, reativação e restauração estrutural
foram aprovados. O marcador temporário foi removido e a página terminou no estado original.

### 6.3 Diagramas

- [x] Listar diagramas encontrados pelo nome visível.
- [x] Mostrar ou ocultar cada diagrama.
- [x] Restaurar cada diagrama ao estado original.
- [x] Tratar nomes repetidos sem usar o texto como ID único.
- [x] Tratar ausência total de diagramas sem erro.
- [x] Não duplicar o controle nativo de visibilidade da seção.
- [x] Exibir a lista individual em seletor lateral rolável, com contagem de itens visíveis.

Validação automatizada de 2026-08-26: leitura semântica, fallback de nome, desambiguação de nomes
repetidos, ações por índice, ocultação do item estrutural, ausência total, restauração exata e fluxo
integrado pelo painel estão cobertos. A interface não oferece visibilidade da seção completa nem
compactação e apresenta a contagem de itens visíveis em seletor lateral rolável.

### 6.4 Integração com impressão

- [x] Confirmar que o painel não aparece em `@media print`.
- [x] Confirmar que o botão nativo de impressão continua funcionando.
- [x] Confirmar que as alterações visíveis aparecem na impressão/PDF.
- [x] Confirmar no PDF que a edição de conteúdo não introduz indicadores visuais.
- [x] Confirmar que restaurar antes de imprimir devolve o resultado original.
- [x] Não interceptar, substituir ou disparar automaticamente a impressão.

Validação manual informada pelo mantenedor em 2026-08-26: painel ausente na impressão, fluxo nativo
preservado, alterações refletidas no PDF sem indicadores de edição e restauração anterior à impressão
aprovados. A auditoria do código confirma que o CifraInk apenas oculta sua interface em `@media print`
e não registra listeners de impressão nem chama `window.print()`.

### 6.5 Tom e afinação

- [x] Representar nas fixtures as linhas estruturais de tom e afinação observadas na página real.
- [x] Localizar as duas linhas por atributos semânticos, restritas às páginas de impressão.
- [x] Mostrar ou ocultar tom e afinação independentemente.
- [x] Ocultar controles de metadados ausentes sem bloquear os demais recursos.
- [x] Restaurar somente a visibilidade capturada, preservando mudanças feitas pelos controles nativos.
- [x] Integrar os switches ao grupo Cabeçalho sem criar estado ou módulo adicional.
- [x] Cobrir adaptador, estado, painel e ciclo de vida com testes proporcionais ao risco.
- [ ] Executar smoke na página real com o bundle atualizado e validar o resultado impresso.

Validação automatizada de 2026-08-27: fixtures sanitizadas, seletores estruturais, isolamento da raiz,
ausência independente, visibilidade reversível, preservação do valor nativo e restauração integrada
ao painel cobertos. No smoke manual, as linhas foram ocultadas independentemente, os controles
nativos permaneceram funcionais e a restauração devolveu o estado inicial. A repetição visual no
resultado impresso permanece pendente.

Correção de 2026-08-27: a inspeção combinada identificou 20 px residuais no wrapper externo da
configuração de acordes. O adaptador passou a reconhecer esse alvo estrutural e a visibilidade
conjunta remove sua margem sem alterar os controles nativos ou as linhas individuais. A medição no
Chrome confirmou espaço residual efetivo de 0 px, popover lateral a 8 px do acionador e restauração
exata dos dois agrupadores.

## 7. Robustez e compatibilidade — pós-lançamento

Decisão de 2026-08-26: esta seção foi adiada sem ter suas tarefas removidas ou concluídas. Ela não
bloqueia a primeira submissão à Chrome Web Store e permanece como backlog de estabilização.

- [ ] Repetir a baseline nativa com edições e controles do CifraInk ativos.
- [ ] Reconsultar alvos por `CifraClubPage` após mudanças nativas relevantes.
- [ ] Reaplicar somente estados do CifraInk perdidos por elementos recriados.
- [ ] Preferir revalidação explícita quando ela for suficiente.
- [ ] Adicionar um único `MutationObserver` apenas se a necessidade for demonstrada.
- [ ] Se adicionado, restringir a raiz, aplicar debounce e suspender mutações próprias.
- [ ] Se adicionado, testar desconexão, desmontagem e ausência de ciclos.
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

## 8. E2E e revisão visual — pós-lançamento

Decisão de 2026-08-26: automação E2E, revisão visual ampliada e auditoria completa de acessibilidade
foram adiadas para depois da primeira publicação. As validações manuais já registradas nas fases 5 e
6 permanecem válidas, mas não concluem antecipadamente os itens abaixo.

### 8.1 Automação

- [ ] Configurar Playwright para carregar a extensão no Chromium.
- [ ] Criar fluxo E2E de inicialização e painel único.
- [ ] Criar fluxo E2E de edição do cabeçalho e conteúdo.
- [ ] Criar fluxo E2E de ocultação individual dos diagramas.
- [ ] Criar fluxo E2E de restauração completa.
- [ ] Criar fluxo E2E com controles nativos de texto e colunas.

### 8.2 Verificação visual

- [ ] Revisar painel aberto e recolhido em viewport comum.
- [ ] Comparar lado a lado o painel do CifraInk e os controles nativos da página.
- [ ] Confirmar coerência de densidade, tipografia, superfícies, bordas, sombras e estados.
- [ ] Confirmar que a identidade do CifraInk permanece distinguível sem quebrar a integração visual.
- [ ] Revisar foco, hover, disabled e incompatibilidade parcial.
- [ ] Revisar página longa com o painel fixo.
- [ ] Revisar impressão A4 de múltiplas páginas.
- [ ] Comparar screenshot antes, alterado e restaurado.
- [ ] Confirmar ausência do painel e indicadores de edição no PDF.

### 8.3 Acessibilidade

- [ ] Percorrer todo o painel somente com teclado.
- [ ] Confirmar associação entre labels e controles.
- [ ] Confirmar ordem de foco previsível.
- [ ] Confirmar nomes acessíveis para botões sem texto visível.
- [ ] Confirmar contraste e foco visível.

## 9. Segurança, privacidade e permissões

- [x] Revisar manifesto final e justificar cada permissão.
- [x] Confirmar ausência de `tabs`, `activeTab` e `scripting`.
- [x] Confirmar ausência de código remoto, `eval` e `innerHTML` editável.
- [x] Confirmar que a extensão não lê cookies ou dados de conta.
- [x] Confirmar que nenhum conteúdo ou identificador é enviado pela rede.
- [x] Confirmar ausência de analytics no MVP.
- [x] Criar uma declaração curta de privacidade coerente com o comportamento real.
- [x] Revisar dependências e licenças antes da distribuição.

Validação de 2026-08-26: manifesto-fonte e build MV3 aprovados sem permissões explícitas, superfícies
privilegiadas ou código remoto; match e recursos acessíveis permanecem restritos ao Cifra Club. A
auditoria do código e do bundle confirmou ausência de transmissão, armazenamento, cookies, analytics
e execução dinâmica, com as ocorrências internas de WXT e React justificadas em
`docs/SECURITY_REVIEW.md`. `pnpm audit` e `pnpm audit --prod` não encontraram vulnerabilidades; as
cinco dependências distribuídas são MIT e seus avisos foram incluídos no artefato. Foram aprovados
119 testes em `pnpm check`, `pnpm build`, instalação imutável, auditoria de licenças e
`git diff --check`.

## 10. Documentação e distribuição

- [x] Criar `README.md` com objetivo, recursos e instalação para desenvolvimento.
- [x] Documentar comandos e fluxo de testes.
- [x] Documentar como carregar a extensão descompactada no Chrome.
- [x] Documentar limitações conhecidas e página suportada.
- [x] Integrar o ícone oficial e seus arquivos derivados.
- [x] Definir a identidade visual complementar para painel e materiais de publicação.
- [x] Revisar nome, descrição, versão e URLs do manifesto.
- [x] Gerar build de produção limpo.
- [x] Gerar pacote `.zip` reprodutível.
- [ ] Instalar o pacote final em um perfil limpo do Chrome.
- [ ] Executar checklist manual completo no pacote final.
- [x] Preparar textos e imagens para a Chrome Web Store.
- [x] Registrar procedimento de release e atualização rápida de compatibilidade.

Validação parcial de 2026-08-26: documentação pública, manifesto com Chrome 129 e homepage, ícone de
128 px, três screenshots reais sanitizados e materiais promocionais aprovados. Instalação imutável,
auditoria sem vulnerabilidades, 116 testes em `pnpm check`, build limpo e integridade dos PNGs foram
aprovados. Duas gerações do ZIP produziram o mesmo SHA-256
`54df7f1ed9e442eef22c8d5c6f764d678834a633516c3d51a3cafcebaabb2fa2`; o pacote contém somente os
dez arquivos autorizados e foi extraído para teste. Permanecem pendentes a instalação dessa cópia em
perfil limpo e o checklist manual correspondente.

Atualização de correção preparada em 2026-08-27 como `0.1.1`: build e ZIP limpos preservaram os dez
arquivos autorizados. Duas gerações produziram o mesmo SHA-256
`83d8c1840e31a2392770acca5a42dd1cf69a67e7733221d84358495bea964acf`. A instalação do pacote final
em perfil limpo e o checklist manual permanecem pendentes antes do novo envio à loja.

## 11. Gate de estabilização pós-lançamento

Este gate permanece como objetivo para declarar o MVP estabilizado após a primeira publicação. Os
itens pendentes das fases 7 e 8 não bloqueiam a submissão inicial definida na fase 10.

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

## 12. Backlog pós-MVP

### Funções preservadas do legado

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

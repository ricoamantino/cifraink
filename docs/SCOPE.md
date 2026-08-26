# CifraInk — Escopo técnico

- Regras de contribuição: [`../AGENTS.md`](../AGENTS.md)
- Plano executável: [`SPEC.md`](SPEC.md)

## 1. Produto

O CifraInk é uma extensão para Chrome que acrescenta ferramentas de edição à página de impressão do Cifra Club.

A extensão trabalha diretamente sobre o DOM já renderizado. Ela preserva a paginação e o fluxo de impressão do site, adicionando somente os recursos que faltam para preparar uma cifra antes de imprimir ou salvar como PDF.

> Abra a cifra, ajuste na própria página e imprima do seu jeito.

### Público inicial

- Músicos preparando cifras para ensaios e apresentações.
- Equipes de música e grupos religiosos.
- Professores e estudantes de música.

## 2. Objetivos do MVP

O MVP deve permitir que o usuário:

1. Abra uma URL de impressão do Cifra Club.
2. Ative um painel discreto do CifraInk.
3. Edite título, artista, compositor e conteúdo da cifra.
4. Oculte elementos desnecessários.
5. Compacte cabeçalho e diagramas.
6. Restaure a página ao estado encontrado pela extensão.
7. Use normalmente os controles e a impressão do Cifra Club.

O sucesso do MVP será medido pela confiabilidade desse fluxo, não pela quantidade de controles.

## 3. Princípios técnicos

1. **DOM primeiro:** reutilizar a página existente; não criar um renderizador de cifras.
2. **Poucas camadas:** cada módulo deve existir para resolver um problema atual.
3. **Dependência do site isolada:** somente o módulo do Cifra Club conhece seus seletores.
4. **Alterações reversíveis:** capturar o valor original antes da primeira alteração.
5. **Falha segura:** a ausência de um elemento desabilita apenas o recurso relacionado.
6. **Progressive enhancement:** a página continua utilizável mesmo que o CifraInk não inicialize.
7. **Permissões mínimas:** solicitar apenas acesso ao domínio suportado e ao armazenamento.
8. **Processamento local:** não enviar conteúdo, histórico ou dados de uso para servidores.

## 4. Escopo funcional

### 4.1 Obrigatório para o MVP

#### Inicialização e compatibilidade

- Executar somente nas páginas de impressão suportadas.
- Inicializar diretamente pelo content script, sem depender de eventos de abas.
- Inserir uma única instância do painel, mesmo após navegações ou recriações do DOM.
- Informar estado compatível, parcialmente compatível ou incompatível.
- Não lançar erro quando um recurso opcional estiver ausente.

#### Cabeçalho

- Editar título, artista e compositor.
- Mostrar ou ocultar cada item disponível.
- Ativar um modo de cabeçalho compacto.
- Restaurar textos, visibilidade e estilos originais.

#### Conteúdo

- Ativar e desativar edição do conteúdo principal com `contenteditable="plaintext-only"`.
- Preservar espaços, quebras de linha e alinhamento entre acordes e letra.
- Manter a edição restrita ao conteúdo musical identificado.
- Restaurar o conteúdo original da sessão.

#### Diagramas

- Mostrar ou ocultar diagramas individualmente.
- Restaurar a visibilidade original de cada item.
- Não duplicar a visibilidade da seção completa, já oferecida pelo controle nativo.

#### Interface

- Painel recolhível e isolado com Shadow DOM, integrado à coluna de controles quando disponível.
- Fallback flutuante quando a coluna nativa não existir, inclusive em layouts estreitos.
- Linguagem visual coerente com o painel e os controles nativos da página de impressão.
- Superfícies, densidade, hierarquia e estados de controle familiares ao contexto da página.
- Seções: Cabeçalho, Conteúdo e Diagramas.
- Controles com rótulos acessíveis e operação por teclado.
- Botão único de **Restaurar página**.
- Status de compatibilidade visível sem mensagens técnicas.

#### Preferências

- Salvar apenas preferências globais simples:
  - painel aberto ou recolhido;
  - modo compacto do cabeçalho;
  - visibilidade padrão dos elementos suportados.
- Não salvar o texto editado da música no primeiro lançamento.

### 4.2 Depois do MVP

- Rascunhos por música.
- Renomear e anotar diagramas.
- Reordenar diagramas.
- Mover diagramas entre páginas.
- Desfazer/refazer além do histórico nativo de edição de texto.
- Quebras de página manuais.
- Presets de impressão.
- Outros sites, navegadores e idiomas.

Esses recursos só entram após observarmos o comportamento real do paginador e das atualizações reativas do Cifra Club.

### 4.3 Fora de escopo

- Backend, conta ou sincronização em nuvem.
- Catálogo e busca de músicas.
- Download automatizado de conteúdo.
- Transposição própria.
- Reprodução de áudio ou metrônomo.
- Editor gráfico de acordes.
- Renderizador próprio de impressão.
- Exportação para MusicXML, ChordPro ou formatos semelhantes.
- Reutilização de código ou assets do projeto legado.

### 4.4 Cobertura funcional do legado

Esta matriz registra todas as funções observadas no projeto legado. “Depois” significa que a ideia foi preservada, mas não pertence ao primeiro lançamento.

| Função do legado | Decisão no CifraInk | Fase |
|---|---|---|
| Criar um menu lateral na página | Integrar um painel recolhível à coluna nativa, com fallback flutuante | MVP |
| Simplificar título e artista | Implementar modo de cabeçalho compacto | MVP |
| Mostrar ou ocultar compositor | Manter como controle individual quando o campo existir | MVP |
| Mostrar ou ocultar logotipo | Manter como controle de elemento de marca quando for localizado com segurança | MVP |
| Editar título, artista e compositor | Manter com edição direta e restauração | MVP |
| Editar letra e acordes com `contenteditable` | Manter restrito ao contêiner musical reconhecido | MVP |
| Mostrar ou ocultar todos os diagramas | Usar o controle nativo; não duplicar no painel | Nativo |
| Mostrar ou ocultar cada diagrama | Manter | MVP |
| Compactar espaçamento dos diagramas | Não manter; não acrescenta valor suficiente ao MVP | Fora |
| Renomear um acorde no diagrama | Preservar como evolução após validar identidade estável dos acordes | Depois |
| Mostrar ou ocultar marcações de posição do acorde | Preservar como controle individual do diagrama | Depois |
| Adicionar descrição ao diagrama | Preservar como anotação opcional | Depois |
| Criar uma área de diagramas em todas as páginas | Não replicar literalmente; reavaliar como posicionamento seguro | Depois |
| Mover um diagrama para outra página | Preservar somente se o paginador aceitar movimentação sem perda de conteúdo | Depois |
| Recriar o menu ao atualizar ou ativar a aba | Substituir por inicialização idempotente do content script | MVP técnico |
| Reinjetar o script após instalar ou atualizar a extensão | Não manter; o carregamento estático cobre novas páginas e evita permissões extras | Não aplicável |
| Popup informativo com link do repositório | Substituir por popup mínimo com status e instruções, somente se houver utilidade | Depois |
| Página de configurações informativa | Não manter sem configurações reais | Não aplicável |

Funções auxiliares do legado, como verificar visibilidade, localizar acordes e alterar `display`, são detalhes de implementação e não requisitos de produto. Serão reescritas conforme as regras de `CifraClubPage` e `domMutations`.

## 5. Arquitetura

```text
Content script
     │
     ├── localiza a página via CifraClubPage
     ├── monta o painel React em Shadow DOM
     ├── aplica alterações via domMutations
     └── salva preferências via preferences
```

Não haverá service worker, mensageria interna ou página separada de editor no MVP.

### 5.1 `CifraClubPage`

É o único módulo que conhece a estrutura do site. Ele oferece métodos semânticos, por exemplo:

```ts
interface CifraClubPage {
  inspect(): PageCapabilities;
  getHeader(): HTMLElement | null;
  getTitle(): HTMLElement | null;
  getArtist(): HTMLElement | null;
  getComposer(): HTMLElement | null;
  getContentBlocks(): HTMLElement[];
  getChordDiagrams(): HTMLElement[];
  getChordDiagramEntries(): ChordDiagramEntry[];
  getChordDiagramSection(): HTMLElement | null;
  getBrand(): HTMLElement | null;
  getNativeControls(): HTMLElement | null;
}
```

O conteúdo musical é retornado como uma lista porque uma cifra pode possuir um bloco `<pre>` por
página. A ordem do DOM é preservada.

Regras:

- componentes React não podem usar seletores do Cifra Club;
- seletores ficam em um único arquivo próximo ao adaptador;
- elementos opcionais retornam `null` ou lista vazia;
- o adaptador não altera o DOM;
- não criar uma interface genérica para vários sites antes do segundo site existir.

### 5.2 `domMutations`

Um módulo funcional pequeno aplica e restaura alterações:

```ts
setText(element, value);
setVisible(element, visible);
setEditable(element, editable);
captureChildNodes(element);
setStyles(element, styles);
restoreAttribute(element, name);
restoreStyles(element, properties);
restore(element);
restoreAll();
```

`setVisible` usa o atributo `hidden` e uma sobrescrita inline reversível de `display: none !important`,
pois o CSS atual do site redefine a apresentação de alguns elementos marcados como ocultos. O valor
anterior de `hidden`, a propriedade `display` e sua prioridade são preservados sem presumir o estilo
original. `setStyles` recebe nomes de propriedades CSS, altera somente as propriedades declaradas e
aceita `null` para removê-las.

`restoreAttribute` e `restoreStyles` restauram somente os campos indicados e mantêm no snapshot os
demais textos, atributos, filhos e outros estilos ainda pendentes. Isso permite desligar modos
visuais sem perder edições da mesma sessão.

O estado original é capturado em um `Map<Element, Snapshot>` na primeira alteração. O `Map` permite
que `restoreAll()` percorra todos os alvos; ele deve ser limpo após a restauração ou desmontagem da
extensão. Texto, atributos e estilos guardam somente os valores alterados. Ao ativar a edição
musical, os nós filhos de cada bloco reconhecido são clonados uma única vez, sem serialização, para
restaurar marcações de acordes que o navegador possa modificar durante a edição.

Regras:

- modificar somente propriedades declaradas pela operação;
- restaurar os valores efetivamente capturados, nunca valores presumidos;
- preferir propriedades, atributos e classes próprias a reescrever `style` inteiro;
- marcar nós criados pela extensão com `data-cifraink`;
- nunca inserir conteúdo editável com `innerHTML`;
- tornar `restoreAll()` idempotente.

### 5.3 Painel

O React controla apenas a interface do CifraInk. O DOM do Cifra Club continua sendo a fonte de verdade para o documento.

O painel deve parecer uma extensão natural das ferramentas de impressão já presentes. Isso significa
seguir a mesma gramática visual observável: composição compacta, grupos claros, superfícies neutras,
tipografia funcional, bordas e sombras discretas, além de controles com estados reconhecíveis. A
identidade do CifraInk deve aparecer de forma contida, sem competir com a cifra ou simular que o
recurso pertence oficialmente ao Cifra Club.

A integração visual será recriada com CSS próprio dentro do Shadow DOM. Não copiar folhas de estilo,
classes geradas, fontes, ícones ou assets do site, nem depender de herança acidental da página. Os
componentes devem usar elementos HTML nativos sempre que possível e preservar a anatomia familiar de
rótulo, valor, alternância e ação observada nos controles existentes.

Quando o agrupador estrutural dos controles nativos estiver disponível, o host do CifraInk será o
primeiro item dessa coluna e acompanhará seu scroll. A ausência desse agrupador não impede a
inicialização: o painel usa o posicionamento flutuante como fallback, sem consultar classes geradas.

Na montagem inline, os blocos usam superfície branca, borda neutra de baixa opacidade, raio de 16
px e nenhuma sombra, conforme o padrão observado. Ações globais ficam fora dos blocos, com 40 px de
altura, raio de 12 px e superfície neutra. Os ícones nativos dependem de um sprite CSS privado do
site e não são reutilizáveis com segurança no Shadow DOM. O CifraInk usa o conjunto gratuito do
Hugeicons para ícones funcionais, com imports nomeados e sem carregar assets remotos. O logotipo
oficial permanece um SVG próprio e não faz parte dessa biblioteca.

O estado do painel é dividido por origem e só entra quando possui uso real:

- capacidades são inspecionadas pelo `CifraClubPage` e recebidas como propriedades imutáveis;
- aberto/recolhido é estado visual local e independente;
- mensagens, nomes, ícones e visibilidades da interface são derivados, não duplicados em estado;
- valores dos controles funcionais são inicializados e reconsultados a partir do DOM;
- preferências globais só serão incorporadas após a persistência da fase 7.

Usar `useState` para os grupos locais independentes. Introduzir `useReducer` somente se transições
compartilhadas futuras justificarem a complexidade. Não copiar capacidades para estado nem usar
efeitos apenas para mantê-las sincronizadas.

Os controles do cabeçalho leem seu estado inicial pelo adaptador e aplicam cada ação em um alvo
reconsultado. O compositor é apresentado sem o prefixo `Composição de:`, mas o prefixo permanece no
DOM mesmo quando seu valor editável estiver vazio. Inputs continuam disponíveis quando o elemento é
ocultado e recursos ausentes não geram controles.

O modo compacto altera somente `gap` e `margin-bottom` do cabeçalho, `font-size` e `line-height` de
título e artista, e `margin-top` do compositor. Desativá-lo restaura essas propriedades capturadas,
sem presumir os estilos do site e sem restaurar antecipadamente texto ou visibilidade.

O controle de conteúdo reconsulta todos os blocos musicais a cada ação. A edição é considerada
ativa somente quando todos estiverem editáveis e usa `contenteditable="plaintext-only"`, sem aplicar
fonte, `white-space`, quebra de linha, classe ou indicador visual próprio. Desativar restaura apenas
o atributo `contenteditable` original e mantém o texto editado. **Restaurar página** recompõe os nós
filhos originais somente quando houver diferença estrutural; o próprio `<pre>` e descendentes não
alterados preservam sua identidade.

Os controles de diagramas também reconsultam o DOM a cada ação. Cada entrada reúne o elemento
visual, o nome normalizado e o alvo de visibilidade: o `<li>` ancestral quando ele pertence à seção,
ou o próprio diagrama como fallback. Ações individuais usam o índice atual, nunca o texto do acorde
como identificador. Nomes repetidos recebem sufixos de ocorrência, como `A (1)` e `A (2)`, e nomes
ausentes usam `Diagrama N`.

A lista individual fica em um `<details>` nativo fechado por padrão. Quando a seção completa está
fechada, não cria estado React adicional. Seu indicador usa o mesmo ícone, dimensões e estados
visuais do recolhimento principal do CifraInk. O painel não oferece visibilidade da seção completa
nem compactação: o primeiro recurso já existe nos controles nativos e o segundo foi retirado por
não acrescentar valor suficiente ao MVP.

### 5.4 Atualizações do site

Não adicionar `MutationObserver` por antecipação.

Primeiro, testar se os controles nativos recriam os elementos manipulados. Se isso ocorrer, adicionar um único observador com:

- raiz e eventos restritos;
- callback com debounce;
- desconexão durante alterações do CifraInk;
- apenas revalidação e remontagem necessárias;
- teste contra ciclos de mutação.

## 6. Estrutura de arquivos

```text
entrypoints/
  cifraclub.content/
    index.tsx          # inicialização e ciclo de vida
    Panel.tsx          # composição do painel
    HeaderSection.tsx  # controles funcionais do cabeçalho
    ContentSection.tsx # ativação da edição do conteúdo musical
    DiagramSection.tsx # visibilidade individual dos diagramas
    panel.css          # estilos isolados pelo Shadow DOM

src/
  cifraclub/
    page.ts            # consultas semânticas ao DOM
    content.ts         # estado e ações do conteúdo musical
    diagrams.ts        # estado e ações dos diagramas
    header.ts          # estado e ações do cabeçalho
    selectors.ts       # seletores do site
    capabilities.ts    # inspeção e diagnóstico
  dom/
    mutations.ts       # alterações e restauração
    snapshot.ts        # tipos e captura do estado original
  preferences/
    storage.ts         # leitura, escrita e valores padrão
    types.ts
  components/
    FieldToggle.tsx
    RestoreButton.tsx
    Section.tsx
    Status.tsx
    TextField.tsx

tests/
  fixtures/
    full-page.html
    missing-composer.html
    without-diagrams.html
```

Diretrizes:

- manter arquivos pequenos e coesos, sem impor limite artificial de linhas;
- colocar lógica de negócio fora dos componentes;
- evitar pastas `utils`, `helpers`, `services` e `common` genéricas;
- nomear módulos pela responsabilidade concreta;
- criar uma abstração somente quando houver duas utilizações reais ou uma fronteira externa clara;
- manter testes próximos da responsabilidade ou em estrutura espelhada.

## 7. Stack

### Produção

- **WXT** — build e estrutura da extensão Manifest V3.
- **TypeScript** — configuração estrita.
- **React** — painel interativo.
- **Hugeicons Free** — ícones funcionais do painel, importados individualmente.
- **CSS comum dentro do Shadow DOM** — estilos simples com custom properties.
- **WXT Storage / `chrome.storage.local`** — preferências globais.

O módulo de preferências deve aplicar valores padrão e validar manualmente o pequeno objeto salvo. Uma biblioteca de schema só se justifica quando esse formato crescer.

Não usar no MVP:

- Tailwind;
- biblioteca de componentes;
- outros pacotes de ícones além do Hugeicons Free aprovado;
- Zustand ou Redux;
- Immer;
- Zod;
- IndexedDB;
- biblioteca de manipulação do DOM;
- service worker.

Dependências adicionais só entram acompanhadas de um problema concreto que não seja resolvido adequadamente pela plataforma.

### Desenvolvimento

- **pnpm** — pacotes e scripts.
- **Vitest + jsdom** — adaptador, preferências e mutações.
- **React Testing Library** — comportamento do painel.
- **Playwright** — fluxo real com a extensão carregada no Chromium.
- **Biome** — lint e formatação.
- **GitHub Actions** — validação automatizada.

Usar versões estáveis atuais ao iniciar o projeto e fixá-las no lockfile. Não registrar números de versão neste documento.

## 8. Manifesto e segurança

Permissões previstas:

- `storage`;
- host permission limitada às URLs de impressão suportadas do Cifra Club.

Evitar `tabs`, `activeTab` e `scripting`. O content script é declarado estaticamente e inicializa seu próprio fluxo.

Regras adicionais:

- executar no mundo isolado padrão da extensão;
- não usar `eval` nem código remoto;
- não ler cookies, local storage ou dados de conta do site;
- não coletar o conteúdo das músicas;
- não adicionar analytics no MVP;
- não interceptar nem substituir o botão de impressão do site.

## 9. Manutenção do DOM

Quando o site mudar:

1. Reproduzir a falha em uma página conhecida.
2. Atualizar a fixture correspondente antes do seletor.
3. Corrigir apenas `selectors.ts`, `page.ts` ou `capabilities.ts`.
4. Executar os testes unitários das três variações mínimas.
5. Executar o fluxo E2E na cifra de referência.
6. Verificar edição, restauração e impressão.
7. Publicar uma atualização pequena e isolada.

Seletores devem preferir, nesta ordem:

1. atributos semânticos e acessíveis;
2. elementos e relações estruturais estáveis;
3. texto de controles, somente quando necessário e com idioma conhecido;
4. classes geradas, apenas como último recurso.

Não manter várias heurísticas obscuras para esconder incompatibilidade. Se a página não puder ser identificada com confiança, desabilitar o recurso e apresentar diagnóstico.

## 10. Testes e qualidade

### Testes unitários obrigatórios

- página completa reconhecida;
- ausência de compositor;
- ausência de diagramas;
- recurso opcional ausente sem exceção;
- captura realizada apenas na primeira alteração;
- restauração exata de texto, atributo e estilo;
- chamadas repetidas de inicialização e restauração;
- leitura de preferência ausente, válida e inválida.

### Fluxos E2E obrigatórios

1. Abrir a cifra de referência, montar o painel, editar título e conteúdo, ocultar um diagrama e restaurar.
2. Usar os controles nativos de colunas e tamanho do texto e confirmar que o painel continua funcional.

### Gates do CI

- instalação com lockfile imutável;
- typecheck;
- lint e formatação;
- testes unitários;
- build da extensão.

O E2E pode ser executado separadamente no início por depender da página externa. Antes da primeira publicação, deve existir ao menos um fluxo automatizado ou uma checklist manual reproduzível.

## 11. Critérios de aceite do MVP

- A cifra de referência é reconhecida sem erros.
- O painel é montado uma única vez e não herda estilos da página.
- A ausência de compositor ou diagramas não impede os demais recursos.
- Título, artista, compositor e conteúdo podem ser editados quando presentes.
- O alinhamento da cifra é preservado durante a edição.
- O cabeçalho pode ser compactado.
- Elementos suportados podem ser ocultados individualmente.
- **Restaurar página** devolve texto, atributos e estilos aos valores capturados.
- Os controles nativos do Cifra Club continuam funcionando.
- A impressão reflete as alterações visíveis.
- Reabrir a página reaplica somente preferências globais seguras.
- Typecheck, lint, testes e build passam.

## 12. Entregas

### Etapa 1 — Prova técnica

- Criar o projeto WXT.
- Implementar `CifraClubPage` e o relatório de capacidades.
- Mapear a cifra de referência.
- Criar as três fixtures mínimas.
- Validar que edição direta sobrevive às principais mudanças de layout do site.

### Etapa 2 — Núcleo funcional

- Montar o painel em Shadow DOM.
- Implementar `domMutations` e `restoreAll()`.
- Entregar edição e visibilidade do cabeçalho e conteúdo.
- Entregar visibilidade individual dos diagramas.

### Etapa 3 — Qualidade e distribuição

- Persistir preferências globais.
- Cobrir os testes obrigatórios.
- Validar acessibilidade e impressão.
- Revisar manifesto e permissões.
- Gerar o primeiro pacote instalável.

## 13. Decisões registradas

1. Usar **CifraInk** como nome de trabalho.
2. Suportar inicialmente Chrome e Cifra Club.
3. Manipular diretamente o DOM da página de impressão.
4. Aceitar manutenção periódica do adaptador.
5. Manter seletores fora da interface.
6. Usar funções e `Map` para restauração, sem hierarquia de comandos.
7. Persistir somente preferências globais no MVP.
8. Não duplicar controles que o Cifra Club já oferece.
9. Não adicionar backend, service worker ou renderizador próprio.
10. Priorizar o fluxo editar → revisar → imprimir.

## 14. Referências técnicas

- [WXT — Content scripts e Shadow Root UI](https://wxt.dev/guide/essentials/content-scripts.html)
- [Chrome — Content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Chrome — Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Chrome — Manifest V3](https://developer.chrome.com/docs/extensions/mv3/manifest)

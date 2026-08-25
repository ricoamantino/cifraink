# AGENTS.md

Regras globais para qualquer pessoa ou agente que trabalhe neste repositório.

## Fonte de verdade

- Leia `docs/SCOPE.md` antes de alterar comportamento, arquitetura ou dependências.
- Use `docs/SPEC.md` como plano executável e registro de progresso.
- Em caso de conflito, siga nesta ordem: pedido atual do usuário, este arquivo, `docs/SCOPE.md`, `docs/SPEC.md`.
- Não amplie o escopo do MVP sem registrar a decisão em `docs/SCOPE.md`.
- Não marque uma tarefa como concluída sem implementação e verificação correspondentes.

## Objetivo do projeto

O CifraInk é uma extensão Chrome Manifest V3 que adiciona ferramentas de edição à página de impressão do Cifra Club. O MVP manipula diretamente o DOM existente, preserva o fluxo nativo de impressão e mantém todo o processamento local.

## Princípios de engenharia

- Prefira a menor solução correta e legível.
- Crie abstrações somente para uma fronteira externa clara ou após duas utilizações reais.
- Não adicione dependências quando APIs da plataforma resolvem o problema com qualidade semelhante.
- Não antecipe suporte a outros sites, navegadores, backend ou sincronização.
- Evite arquivos e módulos genéricos chamados `utils`, `helpers`, `common` ou `services`.
- Nomeie módulos e funções pela responsabilidade concreta.
- Mantenha componentes de interface livres de seletores e regras específicas do Cifra Club.
- Não reutilize código, ícones ou assets do projeto legado.

## Arquitetura obrigatória

- Use WXT, TypeScript estrito e React para o painel.
- Use um content script estático para inicialização.
- Não crie service worker, mensageria interna ou página separada de editor sem necessidade aprovada e documentada.
- Centralize seletores do Cifra Club em `src/cifraclub/selectors.ts`.
- Centralize consultas semânticas ao DOM em `src/cifraclub/page.ts`.
- Centralize alterações reversíveis em `src/dom/mutations.ts`.
- Centralize preferências em `src/preferences/`.
- Monte a interface em Shadow DOM.
- Mantenha o DOM do Cifra Club como fonte de verdade do documento.

## Regras para manipulação do DOM

- O adaptador localiza elementos, mas não os modifica.
- Componentes React não podem executar `document.querySelector` para localizar elementos do site.
- Retorne `null` ou lista vazia para elementos opcionais; não use exceções como fluxo normal.
- Capture o estado original antes da primeira alteração.
- Armazene snapshots em um `Map<Element, Snapshot>` que possa ser percorrido por `restoreAll()`.
- Limpe snapshots quando a página for restaurada ou a extensão for desmontada.
- Faça inicialização e restauração idempotentes.
- Modifique somente as propriedades necessárias; não sobrescreva o atributo `style` completo.
- Prefira `textContent`, atributos e classes próprias. Nunca insira conteúdo editável com `innerHTML`.
- Marque elementos criados pela extensão com `data-cifraink`.
- Não mova ou remova conteúdo do site no MVP.
- Não adicione `MutationObserver` antes de demonstrar sua necessidade em teste real.
- Se um observador for necessário, restrinja a raiz, aplique debounce, desconecte durante mutações próprias e teste contra ciclos.

## Estado e persistência

- O MVP salva somente preferências globais seguras.
- Não persista letras, acordes ou conteúdo editado por música no MVP.
- Valide manualmente o pequeno objeto salvo e aplique valores padrão para campos ausentes ou inválidos.
- Versione o formato de preferências desde a primeira versão.
- Não use local storage da página; use WXT Storage ou `chrome.storage.local`.
- Não adicione Zustand, Redux, Immer, Zod ou IndexedDB sem decisão registrada.

## Interface

- A interface inicial é em português do Brasil.
- Use HTML semântico, rótulos acessíveis, foco visível e navegação por teclado.
- Use CSS comum isolado pelo Shadow DOM e custom properties para tokens visuais.
- Não use Tailwind nem biblioteca de componentes no MVP.
- Não duplique controles que o Cifra Club já oferece.
- Recursos indisponíveis devem ficar ocultos ou desabilitados com explicação curta.
- Mensagens ao usuário não devem expor seletores, exceções ou detalhes internos.

## Segurança e privacidade

- Solicite apenas `storage` e o host permission estritamente necessário.
- Não use `tabs`, `activeTab`, `scripting`, código remoto ou `eval` no MVP.
- Execute no mundo isolado padrão do content script.
- Não leia cookies, dados de conta, histórico ou armazenamento do Cifra Club.
- Não envie conteúdo, telemetria ou identificadores para servidores.
- Não substitua nem intercepte o fluxo nativo de impressão.

## Qualidade

- Todo código novo deve passar por TypeScript estrito, Biome e testes proporcionais ao risco.
- Teste adaptadores com fixtures HTML mínimas e sanitizadas; não versione letras completas desnecessariamente.
- Teste mutações e restauração, incluindo chamadas repetidas.
- Use Playwright para o fluxo real da extensão no Chromium.
- Um recurso opcional ausente não pode impedir a inicialização dos demais.
- Correções de compatibilidade devem se limitar, sempre que possível, a `src/cifraclub/` e suas fixtures.
- Não considere impressão pronta sem verificação visual da página e do resultado impresso/PDF.

## Fluxo de trabalho

1. Identifique a próxima tarefa não concluída em `docs/SPEC.md`.
2. Confirme dependências e critérios de aceite da etapa.
3. Faça a menor alteração completa que entregue a tarefa.
4. Execute typecheck, lint e testes relevantes.
5. Revise o diff e confirme que não houve expansão de escopo.
6. Marque `[x]` somente nas tarefas realmente concluídas e verificadas.
7. Registre no checklist qualquer trabalho novo descoberto durante a implementação.

## Comandos esperados

Após o scaffold, o `package.json` deve expor comandos equivalentes a:

- `pnpm dev` — desenvolvimento da extensão.
- `pnpm build` — build de produção.
- `pnpm typecheck` — validação TypeScript.
- `pnpm lint` — lint e formatação verificada.
- `pnpm test` — testes unitários.
- `pnpm test:e2e` — testes no Chromium.
- `pnpm check` — typecheck, lint e testes unitários.

Se os nomes mudarem, atualize este arquivo e `docs/SPEC.md` no mesmo trabalho.

## Definição de pronto

Uma tarefa está pronta somente quando:

- o comportamento solicitado está implementado;
- os casos de ausência e falha relevantes foram tratados;
- testes apropriados foram adicionados ou atualizados;
- os comandos de validação aplicáveis passaram;
- documentação e checklist refletem o estado real;
- não existem erros conhecidos ocultados por fallback genérico.

# Fixtures do Cifra Club

Estas fixtures são representações manuais e sanitizadas do contrato DOM necessário aos testes.
Elas não são cópias da página, não preservam aparência visual e não contêm letras reais.

## Referência

- Página observada:
  [Ah, Jesus / Coração Igual Ao Teu](https://www.cifraclub.com.br/julliany-souza/ah-jesus-coracao-igual-ao-teu-2-2/imprimir.html)
- Última observação estrutural: 2026-08-27.

A estrutura preservada inclui o wrapper intermediário direto da raiz de impressão, páginas em
`section`, cabeçalho semântico, marca em
`header > span > i`, conteúdo em `pre`, acordes em `b[data-chord-name]`, diagramas com
`data-chord-mode` e `data-mount`, rótulos em `[data-chord-label]`, grades em `[data-instrument]` e
marcações mínimas por `data-string`, `data-status` e offset estrutural, linhas de tom e afinação
dentro de `[data-chord-config]` com botões identificados por `data-anchor`, seu wrapper estrutural
direto e controles nativos agrupados em `aside > div`. A fixture principal representa violão e
preserva `data-tuning`; os testes derivam
viola caipira, ukulele e cavaco sem esse atributo opcional, sem duplicar documentos completos.

A marca real usa um sprite CSS externo. A fixture mantém somente sua relação estrutural, sem
copiar classe, estilo ou asset.

Classes ofuscadas e IDs de runtime foram removidos porque não oferecem um contrato estável.

## Cenários

- `full-page.html`: duas páginas musicais, compositor e uma página de diagramas.
- `missing-composer.html`: mesmo contrato, sem o campo opcional de compositor.
- `without-diagrams.html`: mesmo cabeçalho e conteúdo, sem a seção opcional de diagramas.

Todos os textos musicais e nomes são sintéticos. A pequena repetição entre arquivos é
intencional: cada cenário deve continuar legível e utilizável de forma isolada.

## Como atualizar

1. Abra a página de referência e confirme a mudança no navegador.
2. Identifique a menor relação semântica ou estrutural que representa o comportamento alterado.
3. Atualize primeiro `full-page.html` e derive as duas variantes removendo somente o recurso
   indicado pelo nome do arquivo.
4. Preserve apenas tags, atributos semânticos e relações necessárias aos testes.
5. Substitua título, artista, compositor e conteúdo musical por dados inventados.
6. Remova scripts, estilos, iframes, anúncios, assets externos, handlers inline, payloads de
   framework, IDs de runtime e classes geradas.
7. Atualize a data de observação e execute `pnpm check` e `pnpm build`.

Nunca copie ou versione o `outerHTML` da página. Um seletor que dependa de classe gerada deve ser
justificado em `src/cifraclub/selectors.ts` e representado aqui somente quando não houver
alternativa mais estável.

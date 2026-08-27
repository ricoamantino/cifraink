# Revisão de segurança e privacidade

Auditoria atualizada em 27 de agosto de 2026 sobre o código-fonte, o lockfile e o build Chrome MV3 do
CifraInk 0.1.1.

## Manifesto e acessos

| Entrada | Valor | Justificativa |
|---|---|---|
| `content_scripts.matches` | `https://www.cifraclub.com.br/*/imprimir.html*` | Executar somente na página suportada em que a interface edita o DOM. |
| `run_at` | `document_idle` | Aguardar o DOM inicial sem observar outras abas ou navegar em nome da pessoa usuária. |
| `world` | `ISOLATED` | Separar o código da extensão do contexto JavaScript da página. |
| `web_accessible_resources` | SVG oficial e CSS gerado do painel | Carregar somente recursos próprios, restritos a `https://www.cifraclub.com.br/*`. |
| Permissões explícitas | Nenhuma | O content script estático cobre o único acesso necessário. |

O manifesto não declara `permissions`, `optional_permissions`, `host_permissions`, `background`,
`action`, `externally_connectable` ou uma política de conteúdo personalizada. Em particular, não usa
`tabs`, `activeTab`, `scripting`, `storage` ou `cookies`.

## Fluxo dos dados

1. O content script localiza elementos já renderizados na página de impressão.
2. O painel recebe somente capacidades e valores necessários para os controles visíveis.
3. As ações alteram diretamente propriedades específicas do DOM.
4. Snapshots mínimos permanecem em memória para permitir restauração.
5. Restaurar, desmontar ou recarregar encerra esses valores temporários.

Não existe backend, sincronização, persistência, exportação de dados, telemetria ou transferência para
terceiros. O conteúdo da página é tratado localmente como **website content** exclusivamente para a
funcionalidade apresentada no painel.

## Auditoria do código e do build

O código da aplicação não usa `fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, cookies,
armazenamento do navegador, analytics, `eval`, `new Function`, `dangerouslySetInnerHTML` ou atribuição
a `innerHTML`. As mutações editáveis usam `textContent`, atributos e clones de nós.

O bundle contém ocorrências internas que não representam coleta ou código remoto:

- o WXT usa `fetch()` somente para carregar `content-scripts/cifraclub.css` por uma URL interna
  `chrome-extension://`;
- o runtime do React contém rotinas genéricas com `innerHTML` e URLs de documentação, mas o CifraInk
  não fornece HTML a essas rotinas nem carrega código dessas URLs;
- o WXT usa `window.postMessage` apenas para invalidar instâncias antigas do mesmo content script; a
  mensagem contém identificadores internos e nunca o conteúdo da cifra.

O artefato não contém scripts remotos, source maps, arquivos de ambiente, testes, fixtures ou dados
musicais versionados.

## Chrome Web Store — Privacy practices

Matriz recomendada para preencher o painel de publicação:

| Campo | Declaração |
|---|---|
| Finalidade única | Editar e preparar cifras na página de impressão do Cifra Club. |
| Website content | Acessado e modificado localmente para entregar a funcionalidade visível. |
| Coleta ou transmissão | Nenhuma informação é enviada ao desenvolvedor ou a terceiros. |
| Retenção | Nenhuma; o estado existe somente na sessão atual da página. |
| Venda ou compartilhamento | Não ocorre. |
| Publicidade, crédito ou finalidade não relacionada | Não ocorre. |
| Interação humana com os dados | Não ocorre. |
| Código remoto | Não utilizado. |
| Política pública | `https://github.com/ricoamantino/cifraink/blob/main/PRIVACY.md` |

O conteúdo da página deve ser declarado como processado localmente mesmo sem transmissão. As respostas
do painel, a listagem e `PRIVACY.md` devem permanecer coerentes entre si.

## Dependências e licenças

`pnpm audit` e `pnpm audit --prod` não encontraram vulnerabilidades conhecidas na data da revisão.
Todas as dependências distribuídas são MIT:

- `@hugeicons/core-free-icons` 4.3.0 e `@hugeicons/react` 1.1.10;
- `react` 19.2.8, `react-dom` 19.2.8 e `scheduler` 0.27.0.

A árvore completa de desenvolvimento usa somente licenças declaradas MIT, MIT-0, Apache-2.0, ISC,
BSD-2-Clause, BSD-3-Clause, MPL-2.0, BlueOak-1.0.0 ou CC0-1.0. Dependências de desenvolvimento não
entram no artefato. Não foram encontradas licenças desconhecidas, GPL, AGPL ou SSPL.

Os avisos obrigatórios das dependências distribuídas ficam em `public/THIRD_PARTY_NOTICES.txt`. Esse
arquivo não define uma licença para o CifraInk, que permanece sem licença própria declarada.

## Procedimento reproduzível

```sh
pnpm install --frozen-lockfile
pnpm audit
pnpm audit --prod
pnpm licenses list --json
pnpm licenses list --prod --json
pnpm check
pnpm build
git diff --check
```

Após o build, revisar `.output/chrome-mv3/manifest.json`, a lista de arquivos do artefato e cada
ocorrência encontrada ao buscar APIs de rede, armazenamento, cookies, execução dinâmica e inserção de
HTML no código-fonte e no bundle.

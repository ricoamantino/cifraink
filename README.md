# CifraInk

O CifraInk é uma extensão para Chrome que acrescenta ferramentas de edição à página de impressão do
Cifra Club. Ela permite preparar uma cifra para ensaios, aulas, apresentações, impressão ou PDF sem
criar uma cópia do documento e sem enviar seu conteúdo para servidores.

O CifraInk é um projeto independente e não é afiliado, associado nem endossado pelo Cifra Club.

## Recursos

- edição de título, artista e compositor;
- visibilidade individual dos itens do cabeçalho e da marca;
- modo de cabeçalho compacto;
- edição direta de letra e acordes nos blocos reconhecidos;
- visibilidade individual dos diagramas;
- restauração exata do estado encontrado ao carregar a página;
- painel acessível, recolhível e oculto durante a impressão.

## Compatibilidade

- Google Chrome 129 ou mais recente;
- páginas HTTPS do Cifra Club com endereço no formato
  `https://www.cifraclub.com.br/<cifra>/imprimir.html`;
- interface em português do Brasil.

A extensão depende da estrutura atual da página de impressão. Se o site mudar, um recurso opcional
pode ficar indisponível sem impedir o restante do painel. O CifraInk não atua nas páginas comuns de
cifra, em outros sites ou em outros navegadores nesta versão.

## Privacidade

Todo o processamento acontece localmente no navegador. Não há conta, analytics, telemetria,
persistência ou transmissão do conteúdo. Consulte a [Política de Privacidade](PRIVACY.md) e a
[revisão técnica](docs/SECURITY_REVIEW.md).

## Desenvolvimento

Requisitos:

- Node.js 22.22.2 ou mais recente;
- pnpm 10.28.2.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Comandos principais:

| Comando | Finalidade |
|---|---|
| `pnpm dev` | Executar o WXT em desenvolvimento. |
| `pnpm check` | Rodar tipos, Biome e testes unitários. |
| `pnpm typecheck` | Validar TypeScript estrito. |
| `pnpm lint` | Validar lint, formatação e imports. |
| `pnpm test` | Executar testes unitários. |
| `pnpm test:e2e` | Executar os cenários Playwright disponíveis. |
| `pnpm build` | Gerar a extensão Chrome MV3 em `.output/chrome-mv3`. |
| `pnpm zip` | Gerar o pacote instalável em `.output`. |

## Carregar a extensão descompactada

1. Execute `pnpm build`.
2. Abra `chrome://extensions` no Chrome.
3. Ative **Modo do desenvolvedor**.
4. Selecione **Carregar sem compactação**.
5. Escolha a pasta `.output/chrome-mv3`.
6. Abra uma página de impressão compatível e confirme o painel CifraInk na coluna de controles.

Para validar exatamente o artefato de publicação, siga o procedimento de perfil limpo em
[`docs/RELEASE.md`](docs/RELEASE.md).

## Arquitetura

Um content script estático reconhece a página por meio de `CifraClubPage`, monta um painel React em
Shadow DOM e aplica alterações reversíveis por `domMutations`. O DOM do site continua sendo a fonte
de verdade; não há service worker, backend, mensageria ou renderizador próprio de cifras.

As decisões técnicas estão em [`docs/SCOPE.md`](docs/SCOPE.md), e o progresso executável está em
[`docs/SPEC.md`](docs/SPEC.md).

## Limitações conhecidas

- o estado e as edições existem somente na sessão atual da página;
- mudanças estruturais futuras no Cifra Club podem exigir atualização dos seletores;
- controles nativos que recriam trechos do DOM podem desfazer alterações do CifraInk até a
  estabilização reativa pós-lançamento;
- não há sincronização, presets, outros idiomas ou suporte oficial a outros navegadores;
- o fluxo nativo do site é responsável pela impressão e pela geração de PDF.

## Licenças

O CifraInk não possui licença própria declarada nesta versão. Os avisos e licenças das dependências
distribuídas estão em [`public/THIRD_PARTY_NOTICES.txt`](public/THIRD_PARTY_NOTICES.txt); esse arquivo
não concede uma licença para o código do CifraInk.

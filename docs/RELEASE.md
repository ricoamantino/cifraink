# Procedimento de release

Este documento descreve a publicação manual do CifraInk na Chrome Web Store. A versão pública atual
é `0.1.0`; a candidata `0.1.1` será uma atualização pública, gratuita, global e em português do
Brasil.

## 1. Preparação

1. Trabalhar a partir da branch `main` sem alterações não revisadas.
2. Confirmar a mesma versão em `package.json`, `wxt.config.ts` e `docs/STORE_LISTING.md`.
3. Confirmar que `PRIVACY.md` já está público no GitHub.
4. Revisar `docs/SECURITY_REVIEW.md` e `public/THIRD_PARTY_NOTICES.txt`.
5. Não adicionar chave, `update_url`, permissões ou arquivos de ambiente ao manifesto.

## 2. Gates e build limpo

```sh
pnpm install --frozen-lockfile
pnpm audit
pnpm check
rm -rf .output
pnpm build
pnpm zip
git diff --check
```

O diretório `.output/chrome-mv3` deve conter somente manifesto, content script, CSS, ícones e avisos
de terceiros. Não devem existir testes, fixtures, source maps, arquivos `.env`, materiais da loja ou
dados locais.

## 3. Reprodutibilidade e checksum

1. Copiar o primeiro ZIP para fora de `.output` ou registrar seu SHA-256.
2. Remover apenas os artefatos gerados em `.output`.
3. Repetir `pnpm build` e `pnpm zip` no mesmo commit e ambiente.
4. Comparar os hashes:

```sh
shasum -a 256 .output/cifraink-0.1.1-chrome.zip
```

Os dois valores devem ser idênticos. Registrar o checksum aprovado no release e nunca reconstruir o
arquivo depois dessa aprovação.

Checksum aprovado para o pacote candidato `0.1.1` em 2026-08-27:

```text
0173cbc59b9d5f1bf9e06bac4543cbc73b096862b377a488d81eff5e4f9c4f6c
```

## 4. Teste do pacote final

1. Extrair o ZIP aprovado em um diretório temporário vazio.
2. Iniciar um perfil limpo do Chrome 129 ou mais recente.
3. Em `chrome://extensions`, ativar **Modo do desenvolvedor** e carregar a pasta extraída por
   **Carregar sem compactação**.
4. Não carregar `.output/chrome-mv3`; o objetivo é validar exatamente o conteúdo do ZIP.
5. Abrir a URL de referência indicada em `docs/STORE_LISTING.md` e verificar:
   - inicialização sem recarregar a página e painel único;
   - edição do título e do compositor, incluindo espaços consecutivos;
   - visibilidade de tom, afinação e marca, além do modo compacto;
   - edição do conteúdo musical e undo/redo nativo;
   - edição do nome de um diagrama;
   - controles preto e laranja, preservando o estado das marcações ao reexibir o diagrama;
   - restauração integral;
   - fallback sem overflow em viewport de 360 px;
   - impressão ou PDF sem o painel CifraInk.
6. Repetir nome, marcações, visibilidade e restauração em páginas com diagramas de viola caipira,
   ukulele e cavaco.

Registrar navegador, sistema, commit, checksum e resultado. Restaurar a página antes de encerrar.

### Registro do candidato 0.1.1

Smoke parcial executado em 2026-08-27 no Chrome `151.0.7922.174`, macOS `26.6.2` e commit
`2d39b3e`, usando o bundle instalado da versão `0.1.1`. Foram aprovados: inicialização sem recarregar
e host único após 3,5 s;
edição de título e compositor com espaços; tom, afinação, marca e modo compacto; conteúdo com
undo/redo; nome, marcações, visibilidade e restauração dos diagramas de violão, viola caipira,
ukulele e cavaco; restauração integral; e viewport de 360 px sem overflow. Não houve erro React
`#418` nem aviso do CifraInk.

A validação não substitui os dois gates restantes: carregar a cópia extraída do ZIP em perfil limpo
e confirmar visualmente a ausência do painel na impressão/PDF. O macOS bloqueou a captura da prévia
de impressão por permissão de gravação de tela, portanto esse resultado não foi inferido nem marcado
como concluído.

## 5. Chrome Web Store

1. Manter a versão pública `0.1.0` disponível durante a revisão da atualização.
2. Usar os campos definitivos de `docs/STORE_LISTING.md`.
3. Enviar o ZIP aprovado da versão `0.1.1` e os PNGs de `store-assets/`.
4. Preencher **Privacy practices** de acordo com `docs/SECURITY_REVIEW.md`.
5. Revisar URLs públicas, distribuição global, preço gratuito e classificação não adulta.
6. Escolher publicação adiada após a aprovação (**deferred publishing**), para liberar manualmente.
7. Enviar para revisão. A submissão e a liberação não são automatizadas.

Depois da aprovação, conferir a página pública antes de liberar. Criar a tag Git da versão somente no
commit efetivamente publicado e anexar o checksum ao registro do release.

## 6. Atualização rápida de compatibilidade

Quando uma mudança do Cifra Club quebrar um seletor:

1. reproduzir a falha e sanitizar a menor estrutura necessária em uma fixture;
2. limitar a correção a `src/cifraclub/` sempre que possível;
3. executar testes, build, restauração e impressão;
4. incrementar somente a versão de correção;
5. repetir integralmente segurança, pacote reprodutível e teste em perfil limpo;
6. enviar a atualização sem ampliar permissões ou escopo funcional.

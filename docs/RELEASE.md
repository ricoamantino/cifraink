# Procedimento de release

Este documento descreve a publicação manual do CifraInk na Chrome Web Store. A versão inicial é
`0.1.0`, pública, gratuita, global e em português do Brasil.

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
shasum -a 256 .output/cifraink-0.1.0-chrome.zip
```

Os dois valores devem ser idênticos. Registrar o checksum aprovado no release e nunca reconstruir o
arquivo depois dessa aprovação.

## 4. Teste do pacote final

1. Extrair o ZIP aprovado em um diretório temporário vazio.
2. Iniciar um perfil limpo do Chrome 129 ou mais recente.
3. Em `chrome://extensions`, ativar **Modo do desenvolvedor** e carregar a pasta extraída por
   **Carregar sem compactação**.
4. Não carregar `.output/chrome-mv3`; o objetivo é validar exatamente o conteúdo do ZIP.
5. Abrir a URL de referência indicada em `docs/STORE_LISTING.md` e verificar:
   - inicialização e painel único;
   - edição do título e do compositor, incluindo espaços consecutivos;
   - edição do conteúdo musical e undo/redo nativo;
   - visibilidade de um diagrama individual;
   - restauração integral;
   - fallback sem overflow em viewport de 360 px;
   - impressão ou PDF sem o painel CifraInk.

Registrar navegador, sistema, commit, checksum e resultado. Restaurar a página antes de encerrar.

## 5. Chrome Web Store

1. Usar os campos definitivos de `docs/STORE_LISTING.md`.
2. Enviar o ZIP aprovado e os PNGs de `store-assets/`.
3. Preencher **Privacy practices** de acordo com `docs/SECURITY_REVIEW.md`.
4. Revisar URLs públicas, distribuição global, preço gratuito e classificação não adulta.
5. Escolher publicação adiada após a aprovação (**deferred publishing**), para liberar manualmente.
6. Enviar para revisão. A submissão e a liberação não são automatizadas.

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

# Baseline de reatividade do DOM

Registro manual do comportamento dos controles nativos da página de impressão do Cifra Club.
Este documento descreve somente estrutura e identidade de elementos; nenhum conteúdo musical foi
copiado.

## Ambiente observado

- Data: 2026-08-25.
- Navegador: Google Chrome.
- URL: `https://www.cifraclub.com.br/<artista>/<cifra>/imprimir.html?keyShape=0`.
- Documento: cifra com várias páginas, acordes em linha e diagramas disponíveis.

Os segmentos editoriais da URL foram omitidos para não registrar nomes da página usada no teste.

## Método

1. Consultar a raiz de impressão, páginas, cabeçalho, campos, blocos musicais, acordes e diagramas.
2. Manter referências aos elementos existentes antes da ação.
3. Acionar um único controle nativo e aguardar 2,2 segundos para a paginação estabilizar.
4. Consultar novamente o DOM e comparar referências com igualdade estrita e `isConnected`.
5. Restaurar o controle e confirmar valores e contagens depois da estabilização.

O diagnóstico foi temporário, executado no contexto da página e não faz parte do código da
extensão.

## Drift estrutural observado

A estrutura real possui atualmente um wrapper intermediário:

```text
[data-print-scroll="true"]
  div
    section[data-size]
```

As fixtures e o adaptador atuais esperam as páginas como filhas diretas da raiz. Por isso, a versão
atual de `CifraClubPage` não encontra páginas nessa página real. A correção foi registrada na seção
2.5 da SPEC e deve preservar o isolamento das consultas à raiz de impressão.

## Resultados

Em todos os cenários, a raiz de impressão, o cabeçalho, o título, o artista e o compositor
permaneceram conectados e com a mesma identidade.

### Coluna de controles

No viewport desktop observado, a raiz de impressão e o `aside` são filhos do mesmo contêiner. O
`aside` possui um único `div` interno que agrupa os controles em coluna, com largura de 270 px e
espaçamento de 12 px. Esse agrupador é a âncora estrutural do painel inline do CifraInk.

Em um viewport de 360 px, o `aside` deixa de existir e os controles essenciais são apresentados em
outra composição. Nesse caso, o CifraInk mantém o overlay responsivo como fallback, sem observar ou
alterar a barra nativa móvel.

| Controle | Efeito estrutural estabilizado | Elementos preservados | Elementos substituídos ou repaginados |
|---|---|---|---|
| Tamanho do texto | 8 para 10 páginas e blocos; contagens de acordes e diagramas mantidas | Raiz, cabeçalho e campos | Lista de páginas e blocos, parte dos acordes, seção e todos os diagramas |
| Uma ou duas colunas | 8 para 5 páginas e blocos | Raiz, cabeçalho e campos | Páginas, blocos, maioria dos acordes, seção e todos os diagramas |
| Tom | Páginas, blocos e acordes mantidos; 12 para 11 diagramas | Raiz, páginas, cabeçalho, campos, blocos e nós dos acordes em linha | Todos os diagramas; seus valores também são recalculados |
| Diagramas no início | 8 para 9 páginas; 12 para 24 diagramas ao manter também os do fim | Raiz, cabeçalho, campos e blocos musicais | Lista de páginas, parte dos acordes, seção e todos os diagramas |

Os controles foram revertidos após cada cenário. Ao final, a página foi devolvida ao estado anterior
ao diagnóstico e as contagens estruturais correspondentes foram confirmadas.

## Decisão para o CifraInk

Há recriação comprovada de alvos que o MVP modificará, principalmente após mudanças de tamanho,
colunas e diagramas. Ainda assim, não há controles do CifraInk ativos nesta fase para demonstrar a
necessidade de observação contínua.

Nenhum listener ou `MutationObserver` será adicionado agora. Depois das fases 5 e 6, os mesmos
cenários devem ser repetidos com edições e preferências ativas. A implementação deve primeiro tentar
reconsultas explícitas por `CifraClubPage` e reaplicar somente o estado perdido. Um observador só será
aceito se essa estratégia não for suficiente.

## Como atualizar esta baseline

- Use uma página real com várias páginas e diagramas, sem registrar seu conteúdo.
- Registre a data e a forma estrutural da raiz antes de testar os controles.
- Compare identidade e conexão; contagens iguais não comprovam preservação dos nós.
- Restaure cada controle e a configuração inicial da página.
- Atualize fixtures e seletores apenas em uma tarefa própria, com testes sanitizados.

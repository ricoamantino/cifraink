import { describe, expect, it } from 'vitest';
import type { PageCapabilities } from '../../src/cifraclub/capabilities';
import { CifraClubPage } from '../../src/cifraclub/page';
import fullPageHtml from '../fixtures/full-page.html?raw';
import missingComposerHtml from '../fixtures/missing-composer.html?raw';
import withoutDiagramsHtml from '../fixtures/without-diagrams.html?raw';

function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

const completeCapabilities = {
  status: 'compatible',
  printRoot: true,
  title: true,
  artist: true,
  composer: true,
  content: true,
  chordDiagrams: true,
  brand: true,
} satisfies PageCapabilities;

describe('CifraClubPage', () => {
  it('localiza os recursos da página completa', () => {
    const document = parseHtml(fullPageHtml);
    const page = new CifraClubPage(document);
    const printRoot = document.querySelector('[data-print-scroll="true"]');

    expect(page.getTitle()?.textContent).toBe('Canção de Teste');
    expect(page.getArtist()?.textContent).toBe('Artista de Teste');
    expect(page.getComposer()?.textContent).toBe('Composição de: Pessoa Autora');
    expect(page.getContentBlocks()).toHaveLength(2);
    expect(page.getChordDiagramSection()?.textContent).toContain('Bm7');
    expect(page.getChordDiagrams()).toHaveLength(2);
    expect(page.getChordDiagramEntries().map((entry) => entry.name)).toEqual(['A', 'Bm7']);
    expect(
      page.getChordDiagramEntries().every((entry) => entry.visibilityTarget.tagName === 'LI'),
    ).toBe(true);
    expect(page.getBrand()).not.toBeNull();
    expect(page.getHeader()?.tagName).toBe('HEADER');
    expect(page.getNativeControls()?.textContent).toContain('Imprimir');
    expect(page.inspect()).toEqual(completeCapabilities);
    expect(page.getContentBlocks().every((content) => printRoot?.contains(content))).toBe(true);
  });

  it('trata a ausência do compositor como compatibilidade parcial', () => {
    const page = new CifraClubPage(parseHtml(missingComposerHtml));

    expect(page.getComposer()).toBeNull();
    expect(page.inspect()).toEqual({
      ...completeCapabilities,
      status: 'partial',
      composer: false,
    });
  });

  it('trata a ausência dos diagramas como compatibilidade parcial', () => {
    const page = new CifraClubPage(parseHtml(withoutDiagramsHtml));

    expect(page.getChordDiagramSection()).toBeNull();
    expect(page.getChordDiagrams()).toEqual([]);
    expect(page.getChordDiagramEntries()).toEqual([]);
    expect(page.inspect()).toEqual({
      ...completeCapabilities,
      status: 'partial',
      chordDiagrams: false,
    });
  });

  it('classifica um documento sem conteúdo musical como incompatível', () => {
    const document = parseHtml(fullPageHtml);

    for (const content of document.querySelectorAll('pre')) {
      content.remove();
    }

    const page = new CifraClubPage(document);

    expect(page.getContentBlocks()).toEqual([]);
    expect(page.inspect()).toEqual({
      ...completeCapabilities,
      status: 'incompatible',
      content: false,
    });
  });

  it('não retorna conteúdo externo à raiz de impressão', () => {
    const document = parseHtml(fullPageHtml);
    const externalPage = document.createElement('section');
    const externalContent = document.createElement('pre');
    externalPage.dataset.size = 'a4';
    externalPage.append(externalContent);
    document.querySelector('aside')?.append(externalPage);

    const contentBlocks = new CifraClubPage(document).getContentBlocks();

    expect(contentBlocks).not.toContain(externalContent);
    expect(contentBlocks).toHaveLength(2);
  });

  it('mantém compatibilidade com páginas diretamente sob a raiz de impressão', () => {
    const document = parseHtml(fullPageHtml);
    const printRoot = document.querySelector('[data-print-scroll="true"]');
    const wrapper = printRoot?.firstElementChild;

    if (!printRoot || !wrapper) {
      throw new Error('Estrutura de impressão ausente na fixture');
    }

    printRoot.replaceChildren(...Array.from(wrapper.children));
    const page = new CifraClubPage(document);

    expect(page.getContentBlocks()).toHaveLength(2);
    expect(page.getChordDiagrams()).toHaveLength(2);
    expect(page.getChordDiagramSection()?.tagName).toBe('SECTION');
    expect(page.inspect()).toEqual(completeCapabilities);
  });

  it('ignora diagramas fora das páginas reconhecidas', () => {
    const document = parseHtml(fullPageHtml);
    const printRoot = document.querySelector('[data-print-scroll="true"]');
    const unrelatedWrapper = document.createElement('div');
    const unrelatedPage = document.createElement('section');
    const unrelatedDiagram = document.createElement('div');
    unrelatedPage.dataset.size = 'a4';
    unrelatedDiagram.dataset.chordMode = 'guitar';
    unrelatedPage.append(unrelatedDiagram);
    unrelatedWrapper.append(unrelatedPage);
    printRoot?.append(unrelatedWrapper);

    const page = new CifraClubPage(document);

    expect(page.getChordDiagrams()).toEqual([]);
    expect(page.getChordDiagrams()).not.toContain(unrelatedDiagram);
    expect(page.inspect()).toMatchObject({ status: 'incompatible', content: false });
  });

  it('usa o próprio diagrama como alvo quando o item estrutural está ausente', () => {
    const document = parseHtml(fullPageHtml);
    const page = new CifraClubPage(document);
    const diagram = page.getChordDiagrams()[0];
    const section = page.getChordDiagramSection();

    if (!diagram || !section) {
      throw new Error('Fixture sem diagrama completo');
    }

    section.prepend(diagram);

    expect(page.getChordDiagramEntries()[0]).toMatchObject({
      diagram,
      name: 'A',
      visibilityTarget: diagram,
    });
  });

  it('retorna null quando o agrupador de controles nativos está ausente', () => {
    const document = parseHtml(fullPageHtml);
    document.querySelector('aside')?.remove();

    expect(new CifraClubPage(document).getNativeControls()).toBeNull();
  });

  it('repete consultas sem cache ou compartilhamento das listas retornadas', () => {
    const document = parseHtml(fullPageHtml);
    const originalHtml = document.documentElement.outerHTML;
    const page = new CifraClubPage(document);
    const firstContentBlocks = page.getContentBlocks();
    const firstChordDiagrams = page.getChordDiagrams();
    const firstInspection = page.inspect();
    const secondContentBlocks = page.getContentBlocks();
    const secondChordDiagrams = page.getChordDiagrams();

    expect(secondContentBlocks).not.toBe(firstContentBlocks);
    expect(secondContentBlocks).toHaveLength(firstContentBlocks.length);
    expect(secondContentBlocks[0]).toBe(firstContentBlocks[0]);
    expect(secondChordDiagrams).not.toBe(firstChordDiagrams);
    expect(secondChordDiagrams).toHaveLength(firstChordDiagrams.length);
    expect(secondChordDiagrams[0]).toBe(firstChordDiagrams[0]);
    expect(page.inspect()).toEqual(firstInspection);
    expect(document.documentElement.outerHTML).toBe(originalHtml);

    page.getComposer()?.remove();

    expect(page.getComposer()).toBeNull();
    expect(page.inspect()).toEqual({
      ...completeCapabilities,
      status: 'partial',
      composer: false,
    });
  });

  it('mantém o DOM intacto ao executar todas as consultas', () => {
    const document = parseHtml(fullPageHtml);
    const originalHtml = document.documentElement.outerHTML;
    const page = new CifraClubPage(document);

    page.getTitle();
    page.getArtist();
    page.getComposer();
    page.getContentBlocks();
    page.getChordDiagramSection();
    page.getChordDiagrams();
    page.getChordDiagramEntries();
    page.getBrand();
    page.getHeader();
    page.getNativeControls();
    page.inspect();

    expect(document.documentElement.outerHTML).toBe(originalHtml);
  });
});

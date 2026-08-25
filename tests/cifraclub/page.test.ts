import { describe, expect, it } from 'vitest';
import { CifraClubPage } from '../../src/cifraclub/page';
import fullPageHtml from '../fixtures/full-page.html?raw';
import missingComposerHtml from '../fixtures/missing-composer.html?raw';
import withoutDiagramsHtml from '../fixtures/without-diagrams.html?raw';

function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

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
    expect(page.getBrand()).not.toBeNull();
    expect(page.inspect()).toEqual({
      status: 'compatible',
      printRoot: true,
      title: true,
      artist: true,
      composer: true,
      content: true,
      chordDiagrams: true,
      brand: true,
    });
    expect(page.getContentBlocks().every((content) => printRoot?.contains(content))).toBe(true);
  });

  it('trata a ausência do compositor como compatibilidade parcial', () => {
    const page = new CifraClubPage(parseHtml(missingComposerHtml));

    expect(page.getComposer()).toBeNull();
    expect(page.inspect()).toMatchObject({ status: 'partial', composer: false });
  });

  it('trata a ausência dos diagramas como compatibilidade parcial', () => {
    const page = new CifraClubPage(parseHtml(withoutDiagramsHtml));

    expect(page.getChordDiagramSection()).toBeNull();
    expect(page.getChordDiagrams()).toEqual([]);
    expect(page.inspect()).toMatchObject({ status: 'partial', chordDiagrams: false });
  });

  it('classifica um documento sem conteúdo musical como incompatível', () => {
    const document = parseHtml(fullPageHtml);

    for (const content of document.querySelectorAll('pre')) {
      content.remove();
    }

    const page = new CifraClubPage(document);

    expect(page.getContentBlocks()).toEqual([]);
    expect(page.inspect()).toMatchObject({ status: 'incompatible', content: false });
  });

  it('não retorna conteúdo externo à raiz de impressão', () => {
    const document = parseHtml(fullPageHtml);
    const externalContent = document.createElement('pre');
    document.querySelector('aside')?.append(externalContent);

    const contentBlocks = new CifraClubPage(document).getContentBlocks();

    expect(contentBlocks).not.toContain(externalContent);
    expect(contentBlocks).toHaveLength(2);
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
    page.getBrand();
    page.inspect();

    expect(document.documentElement.outerHTML).toBe(originalHtml);
  });
});

import { describe, expect, it } from 'vitest';
import fullPageHtml from './fixtures/full-page.html?raw';
import missingComposerHtml from './fixtures/missing-composer.html?raw';
import withoutDiagramsHtml from './fixtures/without-diagrams.html?raw';

interface FixtureExpectation {
  diagramCount: number;
  hasComposer: boolean;
  html: string;
  name: string;
  pageCount: number;
}

const fixtures: FixtureExpectation[] = [
  {
    diagramCount: 2,
    hasComposer: true,
    html: fullPageHtml,
    name: 'página completa',
    pageCount: 3,
  },
  {
    diagramCount: 2,
    hasComposer: false,
    html: missingComposerHtml,
    name: 'página sem compositor',
    pageCount: 3,
  },
  {
    diagramCount: 0,
    hasComposer: true,
    html: withoutDiagramsHtml,
    name: 'página sem diagramas',
    pageCount: 2,
  },
];

function parseFixture(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

function containsComposer(document: Document): boolean {
  return Array.from(document.querySelectorAll('header small')).some((element) =>
    element.textContent?.startsWith('Composição de:'),
  );
}

describe.each(fixtures)('$name', ({ diagramCount, hasComposer, html, pageCount }) => {
  it('preserva somente o contrato estrutural esperado', () => {
    const document = parseFixture(html);
    const printRoot = document.querySelector('[data-print-scroll="true"]');
    const wrapper = printRoot?.firstElementChild;
    const pages = Array.from(wrapper?.children ?? []).filter(
      (element) => element.tagName === 'SECTION',
    );
    const musicPages = pages.filter((page) => page.querySelector('pre'));

    expect(printRoot).not.toBeNull();
    expect(printRoot?.children).toHaveLength(1);
    expect(wrapper?.tagName).toBe('DIV');
    expect(pages).toHaveLength(pageCount);
    expect(musicPages).toHaveLength(2);
    expect(document.querySelectorAll('header')).toHaveLength(1);
    expect(document.querySelector('h1')?.textContent).toBe('Canção de Teste');
    expect(document.querySelector('h2')?.textContent).toBe('Artista de Teste');
    expect(containsComposer(document)).toBe(hasComposer);
    const chordConfig = document.querySelector(
      '[data-chord-config="true"][data-chord-select="true"]',
    );
    expect(chordConfig?.children).toHaveLength(2);
    expect(chordConfig?.parentElement?.parentElement?.tagName).toBe('SECTION');
    expect(
      chordConfig?.querySelector('button[data-anchor="--chord-tone"]')?.parentElement?.tagName,
    ).toBe('DIV');
    expect(
      chordConfig?.querySelector('button[data-anchor="--chord-tuning"]')?.parentElement?.tagName,
    ).toBe('DIV');
    expect(document.querySelectorAll('[data-chord-mode="guitar"]')).toHaveLength(diagramCount);
    expect(document.querySelector('aside')).not.toBeNull();
    expect(document.querySelector('aside > div')).not.toBeNull();
    expect(document.querySelector('aside pre')).toBeNull();
  });

  it('representa conteúdo multipágina, colunas e acordes especiais', () => {
    const document = parseFixture(html);
    const musicBlocks = Array.from(document.querySelectorAll('pre'));
    const chordNames = Array.from(document.querySelectorAll('[data-chord-name]')).map((element) =>
      element.getAttribute('data-chord-name'),
    );

    expect(musicBlocks).toHaveLength(2);

    for (const musicBlock of musicBlocks) {
      expect(
        Array.from(musicBlock.children).filter((child) => child.tagName === 'SPAN'),
      ).toHaveLength(2);
    }

    expect(chordNames).toContain('G/B');
    expect(chordNames.filter((name) => name === 'F#m7')).toHaveLength(2);
  });

  it('não contém conteúdo ativo, assets externos ou atributos de runtime', () => {
    const document = parseFixture(html);

    expect(document.querySelector('script, style, iframe, svg, img, link')).toBeNull();
    expect(document.querySelector('[class], [id]')).toBeNull();

    for (const element of Array.from(document.querySelectorAll('*'))) {
      for (const attribute of Array.from(element.attributes)) {
        expect(attribute.name).not.toMatch(/^on/i);

        if (attribute.name === 'href' || attribute.name === 'src') {
          expect(attribute.value).not.toMatch(/^(?:https?:)?\/\//i);
        }
      }
    }
  });
});

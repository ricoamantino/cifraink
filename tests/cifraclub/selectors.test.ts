import { describe, expect, it } from 'vitest';
import { cifraClubSelectors, cifraClubText } from '../../src/cifraclub/selectors';
import fullPageHtml from '../fixtures/full-page.html?raw';

function parseFixture(): Document {
  return new DOMParser().parseFromString(fullPageHtml, 'text/html');
}

describe('seletores do Cifra Club', () => {
  it('localiza a estrutura completa dentro da raiz de impressão', () => {
    const document = parseFixture();
    const printRoot = document.querySelector(cifraClubSelectors.printRoot);

    if (!printRoot) {
      throw new Error('Fixture sem raiz de impressão');
    }

    const pages = Array.from(printRoot.querySelectorAll(cifraClubSelectors.page));
    const header = pages[0]?.querySelector(cifraClubSelectors.header);

    if (!header) {
      throw new Error('Fixture sem cabeçalho');
    }

    const composerCandidates = Array.from(
      header.querySelectorAll(cifraClubSelectors.composerCandidate),
    );
    const contentBlocks = pages.flatMap((page) =>
      Array.from(page.querySelectorAll(cifraClubSelectors.content)),
    );
    const chords = contentBlocks.flatMap((content) =>
      Array.from(content.querySelectorAll(cifraClubSelectors.chord)),
    );

    expect(pages).toHaveLength(3);
    expect(header.querySelector(cifraClubSelectors.title)?.textContent).toBe('Canção de Teste');
    expect(header.querySelector(cifraClubSelectors.artist)?.textContent).toBe('Artista de Teste');
    expect(
      composerCandidates.some((candidate) =>
        candidate.textContent?.startsWith(cifraClubText.composerPrefix),
      ),
    ).toBe(true);
    expect(header.querySelector(cifraClubSelectors.brand)).not.toBeNull();
    const chordConfig = pages[0]?.querySelector(cifraClubSelectors.chordConfig);
    expect(chordConfig?.querySelector(cifraClubSelectors.toneValue)?.textContent).toBe('A');
    expect(chordConfig?.querySelector(cifraClubSelectors.tuningValue)?.textContent).toBe(
      'E A D G B E',
    );
    expect(contentBlocks).toHaveLength(2);
    expect(chords).toHaveLength(6);
    const diagrams = Array.from(printRoot.querySelectorAll(cifraClubSelectors.chordDiagram));

    expect(diagrams).toHaveLength(2);
    expect(diagrams[0]?.querySelector(cifraClubSelectors.chordDiagramName)?.textContent).toBe('A');
    expect(diagrams[0]?.closest(cifraClubSelectors.chordDiagramItem)?.tagName).toBe('LI');
  });

  it('não confunde controles nativos com o conteúdo musical', () => {
    const document = parseFixture();
    const printRoot = document.querySelector(cifraClubSelectors.printRoot);
    const nativeControls = printRoot?.parentElement?.querySelector(
      cifraClubSelectors.nativeControls,
    );

    if (!printRoot || !nativeControls) {
      throw new Error('Fixture sem raiz de impressão ou controles nativos');
    }

    expect(printRoot.contains(nativeControls)).toBe(false);
    expect(nativeControls.querySelector(cifraClubSelectors.content)).toBeNull();
  });

  it('não depende de classes geradas', () => {
    const selectors = Object.values(cifraClubSelectors).join(' ');

    expect(selectors).not.toMatch(/(?:^|[\s>+~,])\.[a-z_-]/i);
  });
});

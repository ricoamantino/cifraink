import { afterEach, describe, expect, it } from 'vitest';
import { applyDiagramControlAction, readDiagramControlState } from '../../src/cifraclub/diagrams';
import { CifraClubPage } from '../../src/cifraclub/page';
import { restoreAll } from '../../src/dom/mutations';
import fullPageHtml from '../fixtures/full-page.html?raw';
import withoutDiagramsHtml from '../fixtures/without-diagrams.html?raw';

function parsePage(html = fullPageHtml): { document: Document; page: CifraClubPage } {
  const document = new DOMParser().parseFromString(html, 'text/html');
  return { document, page: new CifraClubPage(document) };
}

const instruments = [
  { mode: 'guitar', name: 'violão', tuning: true },
  { mode: 'viola', name: 'viola caipira', tuning: false },
  { mode: 'ukulele', name: 'ukulele', tuning: false },
  { mode: 'cavaco', name: 'cavaco', tuning: false },
] as const;

afterEach(() => {
  restoreAll();
});

describe('controles dos diagramas', () => {
  describe.each(instruments)('$name', ({ mode, tuning }) => {
    it('localiza, controla e restaura os diagramas', () => {
      const { document, page } = parsePage();
      const fixtureDiagrams = Array.from(
        document.querySelectorAll<HTMLElement>('[data-chord-mode]'),
      );

      for (const diagram of fixtureDiagrams) {
        diagram.dataset.chordMode = mode;

        if (!tuning) {
          diagram.removeAttribute('data-tuning');
        }
      }

      const diagrams = page.getChordDiagrams();
      const entries = page.getChordDiagramEntries();

      expect(diagrams).toHaveLength(2);
      expect(diagrams.every((diagram) => diagram.dataset.chordMode === mode)).toBe(true);
      expect(diagrams.every((diagram) => diagram.hasAttribute('data-tuning'))).toBe(tuning);
      expect(page.getChordDiagramSection()).not.toBeNull();
      expect(entries.map((entry) => entry.name)).toEqual(['A', 'Bm7']);
      expect(entries.every((entry) => entry.visibilityTarget.tagName === 'LI')).toBe(true);
      expect(page.inspect()).toMatchObject({ status: 'compatible', chordDiagrams: true });
      expect(readDiagramControlState(page)).toMatchObject({ available: true });

      const target = entries[0]?.visibilityTarget;

      if (!target) {
        throw new Error('Fixture sem alvo de visibilidade');
      }

      applyDiagramControlAction(page, {
        type: 'set-diagram-visible',
        index: 0,
        visible: false,
      });

      expect(target.hidden).toBe(true);
      expect(readDiagramControlState(page).items[0]?.visible).toBe(false);

      restoreAll();

      expect(target.hidden).toBe(false);
      expect(readDiagramControlState(page).items[0]?.visible).toBe(true);
    });
  });

  it('lê nomes, disponibilidade e visibilidade diretamente do DOM', () => {
    const { page } = parsePage();

    expect(readDiagramControlState(page)).toEqual({
      available: true,
      items: [
        { index: 0, label: 'A', visible: true },
        { index: 1, label: 'Bm7', visible: true },
      ],
    });
  });

  it('trata ausência total sem erro ou mutação', () => {
    const { document, page } = parsePage(withoutDiagramsHtml);
    const originalHtml = document.documentElement.outerHTML;
    const state = readDiagramControlState(page);

    expect(state).toEqual({ available: false, items: [] });
    expect(
      applyDiagramControlAction(page, {
        type: 'set-diagram-visible',
        index: 0,
        visible: false,
      }),
    ).toEqual(state);
    expect(document.documentElement.outerHTML).toBe(originalHtml);
  });

  it('gera fallback para nome ausente e desambigua nomes repetidos sem usá-los como índice', () => {
    const { page } = parsePage();
    const section = page.getChordDiagramSection();
    const list = section?.querySelector('ul');
    const firstItem = page.getChordDiagramEntries()[0]?.visibilityTarget;
    const secondName = page.getChordDiagramEntries()[1]?.diagram.querySelector('strong');

    if (!list || !firstItem || !secondName) {
      throw new Error('Fixture sem lista de diagramas completa');
    }

    const duplicateItem = firstItem.cloneNode(true) as HTMLElement;
    list.append(duplicateItem);
    secondName.textContent = '';
    let state = readDiagramControlState(page);

    expect(state.items.map((item) => item.label)).toEqual(['A (1)', 'Diagrama 2', 'A (2)']);

    state = applyDiagramControlAction(page, {
      type: 'set-diagram-visible',
      index: 2,
      visible: false,
    });

    expect(firstItem.hidden).toBe(false);
    expect(duplicateItem.hidden).toBe(true);
    expect(state.items[2]?.visible).toBe(false);
  });

  it('oculta o item completo, preserva os irmãos e restaura exatamente', () => {
    const { page } = parsePage();
    const entries = page.getChordDiagramEntries();
    const firstItem = entries[0]?.visibilityTarget;
    const secondItem = entries[1]?.visibilityTarget;

    if (!firstItem || !secondItem) {
      throw new Error('Fixture sem diagramas completos');
    }

    const original = firstItem.cloneNode(true);
    const state = applyDiagramControlAction(page, {
      type: 'set-diagram-visible',
      index: 0,
      visible: false,
    });

    expect(firstItem.tagName).toBe('LI');
    expect(firstItem.hidden).toBe(true);
    expect(firstItem.style.getPropertyValue('display')).toBe('none');
    expect(firstItem.style.getPropertyPriority('display')).toBe('important');
    expect(secondItem.hidden).toBe(false);
    expect(state.items.map((item) => item.visible)).toEqual([false, true]);

    restoreAll();

    expect(firstItem.isEqualNode(original)).toBe(true);
    expect(readDiagramControlState(page).items[0]?.visible).toBe(true);
  });

  it('ignora índice inexistente sem afetar os itens', () => {
    const { page } = parsePage();
    const state = readDiagramControlState(page);

    expect(
      applyDiagramControlAction(page, {
        type: 'set-diagram-visible',
        index: 99,
        visible: false,
      }),
    ).toEqual(state);
  });
});

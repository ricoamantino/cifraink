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

afterEach(() => {
  restoreAll();
});

describe('controles dos diagramas', () => {
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

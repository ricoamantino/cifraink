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
        const grid = diagram.querySelector<HTMLElement>('[data-instrument]');

        if (grid) {
          grid.dataset.instrument = mode;
        }

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
      expect(entries.every((entry) => entry.nameElement?.dataset.chordLabel === 'true')).toBe(true);
      expect(entries.every((entry) => entry.markingTargets.length > 0)).toBe(true);
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
        {
          index: 0,
          label: 'A',
          markingsAvailable: true,
          markingsVisible: true,
          name: 'A',
          visible: true,
        },
        {
          index: 1,
          label: 'Bm7',
          markingsAvailable: true,
          markingsVisible: true,
          name: 'Bm7',
          visible: true,
        },
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

  it('oculta marcações, edita o nome e restaura sem afetar grade ou irmãos', () => {
    const { page } = parsePage();
    const entries = page.getChordDiagramEntries();
    const first = entries[0];
    const second = entries[1];
    const grid = first?.diagram.querySelector<HTMLElement>('[data-instrument]');
    const playButton = first?.diagram.querySelector<HTMLButtonElement>('[data-chord-play-button]');
    const originalName = first?.nameElement?.textContent;

    if (!first?.nameElement || !second || !grid) {
      throw new Error('Fixture sem estrutura completa de marcações');
    }

    let state = applyDiagramControlAction(page, {
      type: 'set-diagram-markings-visible',
      index: 0,
      visible: false,
    });

    expect(first.markingTargets.every((target) => target.hidden)).toBe(true);
    expect(first.markingTargets.every((target) => target.style.display === 'none')).toBe(true);
    expect(second.markingTargets.every((target) => !target.hidden)).toBe(true);
    expect(grid.hidden).toBe(false);
    expect(playButton?.hidden ?? false).toBe(false);
    expect(first.nameElement.hidden).toBe(false);
    expect(state.items[0]?.markingsVisible).toBe(false);

    state = applyDiagramControlAction(page, {
      type: 'set-diagram-name',
      index: 0,
      value: 'A editado',
    });

    expect(first.nameElement.textContent).toBe('A editado');
    expect(state.items[0]).toMatchObject({ label: 'A editado', name: 'A editado' });

    restoreAll();

    expect(first.nameElement.textContent).toBe(originalName);
    expect(first.markingTargets.every((target) => !target.hidden)).toBe(true);
    expect(first.markingTargets.every((target) => !target.hasAttribute('style'))).toBe(true);
    expect(readDiagramControlState(page).items[0]).toMatchObject({
      label: 'A',
      markingsVisible: true,
      name: 'A',
    });
  });

  it('mantém recursos independentes quando nome ou marcações não são reconhecidos', () => {
    const { page } = parsePage();
    const entry = page.getChordDiagramEntries()[0];

    if (!entry?.nameElement) {
      throw new Error('Fixture sem nome de diagrama');
    }

    entry.nameElement.removeAttribute('data-chord-label');
    const state = readDiagramControlState(page);

    expect(state.items[0]).toMatchObject({
      label: 'Diagrama 1',
      markingsAvailable: true,
      name: null,
      visible: true,
    });
    expect(
      applyDiagramControlAction(page, {
        type: 'set-diagram-name',
        index: 0,
        value: 'Ignorado',
      }).items[0]?.name,
    ).toBeNull();

    const grid = page
      .getChordDiagramEntries()[1]
      ?.diagram.querySelector<HTMLElement>('[data-instrument]');
    grid?.removeAttribute('data-instrument');

    expect(readDiagramControlState(page).items[1]).toMatchObject({
      label: 'Bm7',
      markingsAvailable: false,
      name: 'Bm7',
      visible: true,
    });
  });

  it('ignora elementos semelhantes fora da estrutura de marcações', () => {
    const { document, page } = parsePage();
    const entry = page.getChordDiagramEntries()[0];

    if (!entry) {
      throw new Error('Fixture sem diagrama');
    }

    const externalPosition = document.createElement('div');
    externalPosition.dataset.string = '99';
    entry.diagram.append(externalPosition);

    const targets = page.getChordDiagramEntries()[0]?.markingTargets ?? [];

    expect(targets).not.toContain(externalPosition);
    expect(targets).not.toContain(entry.diagram.querySelector<HTMLElement>('[data-instrument]'));
    expect(targets).not.toContain(
      entry.diagram.querySelector<HTMLElement>('[data-chord-play-button]'),
    );
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

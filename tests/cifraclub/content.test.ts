import { afterEach, describe, expect, it } from 'vitest';
import { applyContentControlAction, readContentControlState } from '../../src/cifraclub/content';
import { CifraClubPage } from '../../src/cifraclub/page';
import { restoreAll } from '../../src/dom/mutations';
import fullPageHtml from '../fixtures/full-page.html?raw';

function parsePage(): { document: Document; page: CifraClubPage } {
  const document = new DOMParser().parseFromString(fullPageHtml, 'text/html');
  return { document, page: new CifraClubPage(document) };
}

afterEach(() => {
  restoreAll();
});

describe('controle do conteúdo musical', () => {
  it('lê disponibilidade e exige que todos os blocos estejam editáveis', () => {
    const { page } = parsePage();
    const [first, second] = page.getContentBlocks();

    expect(readContentControlState(page)).toEqual({ available: true, editable: false });
    first?.setAttribute('contenteditable', 'plaintext-only');
    expect(readContentControlState(page)).toEqual({ available: true, editable: false });
    second?.setAttribute('contenteditable', 'true');
    expect(readContentControlState(page)).toEqual({ available: true, editable: true });
  });

  it('trata a ausência de blocos sem produzir mutações', () => {
    const { document, page } = parsePage();
    for (const block of page.getContentBlocks()) {
      block.remove();
    }
    const originalHtml = document.documentElement.outerHTML;

    expect(readContentControlState(page)).toEqual({ available: false, editable: false });
    expect(applyContentControlAction(page, { type: 'set-editable', editable: true })).toEqual({
      available: false,
      editable: false,
    });
    expect(document.documentElement.outerHTML).toBe(originalHtml);
  });

  it('ativa todos os blocos sem alterar conteúdo, classes ou estilos', () => {
    const { page } = parsePage();
    const blocks = page.getContentBlocks();
    blocks[0]?.setAttribute('class', 'fixture-class');
    blocks[0]?.style.setProperty('white-space', 'pre-wrap');
    blocks[0]?.style.setProperty('font-family', 'monospace');
    const originals = blocks.map((block) => block.cloneNode(true));

    const state = applyContentControlAction(page, { type: 'set-editable', editable: true });

    expect(state).toEqual({ available: true, editable: true });
    blocks.forEach((block, index) => {
      expect(block.getAttribute('contenteditable')).toBe('plaintext-only');
      const expected = originals[index] as HTMLElement;
      expect(block.textContent).toBe(expected.textContent);
      expect(block.className).toBe(expected.className);
      expect(block.style.cssText).toBe(expected.style.cssText);
    });
  });

  it('desativa preservando edições e restaurando o atributo original exato', () => {
    const { page } = parsePage();
    const [plainBlock, configuredBlock] = page.getContentBlocks();
    configuredBlock?.setAttribute('contenteditable', 'inherit');

    applyContentControlAction(page, { type: 'set-editable', editable: true });
    plainBlock?.append(' marcador temporário');
    applyContentControlAction(page, { type: 'set-editable', editable: false });

    expect(plainBlock?.hasAttribute('contenteditable')).toBe(false);
    expect(plainBlock?.textContent).toContain('marcador temporário');
    expect(configuredBlock?.getAttribute('contenteditable')).toBe('inherit');
  });

  it('restaura nós removidos, incluídos e modificados preservando o pre', () => {
    const { page } = parsePage();
    const block = page.getContentBlocks()[0];

    if (!block) {
      throw new Error('Bloco musical ausente na fixture');
    }

    const original = block.cloneNode(true);
    const blockReference = block;
    applyContentControlAction(page, { type: 'set-editable', editable: true });
    block.querySelector('span')?.remove();
    block.querySelector('b')?.setAttribute('data-chord-name', 'Alterado');
    block.append(document.createElement('span'));

    restoreAll();

    expect(block).toBe(blockReference);
    expect(block.isEqualNode(original)).toBe(true);
    expect(block.querySelector('span')).not.toBeNull();
    expect(block.querySelector('b')?.getAttribute('data-chord-name')).toBe('A');
    expect(block.hasAttribute('contenteditable')).toBe(false);
  });

  it('preserva descendentes sem edição e restaura referências desconectadas', () => {
    const { page } = parsePage();
    const [unchangedBlock, removedBlock] = page.getContentBlocks();
    const unchangedChild = unchangedBlock?.firstChild;
    const removedOriginal = removedBlock?.cloneNode(true);

    applyContentControlAction(page, { type: 'set-editable', editable: true });
    removedBlock?.replaceChildren('Alterado');
    removedBlock?.remove();
    restoreAll();
    restoreAll();

    expect(unchangedBlock?.firstChild).toBe(unchangedChild);
    expect(removedBlock?.isConnected).toBe(false);
    expect(removedBlock?.isEqualNode(removedOriginal ?? null)).toBe(true);
  });
});

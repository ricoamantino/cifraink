import { afterEach, describe, expect, it } from 'vitest';
import {
  applyHeaderControlAction,
  hasHeaderControls,
  readHeaderControlState,
} from '../../src/cifraclub/header';
import { CifraClubPage } from '../../src/cifraclub/page';
import { restoreAll } from '../../src/dom/mutations';
import fullPageHtml from '../fixtures/full-page.html?raw';
import missingComposerHtml from '../fixtures/missing-composer.html?raw';

function parseHtml(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html');
}

afterEach(() => {
  restoreAll();
});

describe('controles do cabeçalho', () => {
  it('lê os valores e disponibilidades diretamente do DOM', () => {
    const page = new CifraClubPage(parseHtml(fullPageHtml));

    expect(readHeaderControlState(page)).toEqual({
      title: { value: 'Canção de Teste', visible: true },
      artist: { value: 'Artista de Teste', visible: true },
      composer: { value: 'Pessoa Autora', visible: true },
      brand: { visible: true },
      compact: false,
      compactAvailable: true,
    });
  });

  it('representa recursos ausentes com null sem bloquear os demais', () => {
    const page = new CifraClubPage(parseHtml(missingComposerHtml));
    const state = readHeaderControlState(page);

    expect(state.composer).toBeNull();
    expect(state.title).not.toBeNull();
    expect(state.artist).not.toBeNull();
    expect(state.brand).not.toBeNull();
    expect(hasHeaderControls(state)).toBe(true);
  });

  it('trata a ausência da marca sem afetar os campos de texto', () => {
    const document = parseHtml(fullPageHtml);
    document.querySelector('header > span > i')?.remove();
    const state = readHeaderControlState(new CifraClubPage(document));

    expect(state.brand).toBeNull();
    expect(state.title).not.toBeNull();
    expect(state.artist).not.toBeNull();
    expect(state.composer).not.toBeNull();
    expect(state.compactAvailable).toBe(true);
  });

  it('não oferece controles quando o cabeçalho está ausente', () => {
    const document = parseHtml(fullPageHtml);
    document.querySelector('header')?.remove();
    const state = readHeaderControlState(new CifraClubPage(document));

    expect(state).toEqual({
      title: null,
      artist: null,
      composer: null,
      brand: null,
      compact: false,
      compactAvailable: false,
    });
    expect(hasHeaderControls(state)).toBe(false);
  });

  it('edita os três textos sem substituir seus links ancestrais', () => {
    const document = parseHtml(fullPageHtml);
    const page = new CifraClubPage(document);
    const titleLink = page.getTitle()?.parentElement;
    const artistLink = page.getArtist()?.parentElement;
    let state = readHeaderControlState(page);

    state = applyHeaderControlAction(page, state, {
      type: 'set-text',
      field: 'title',
      value: 'Novo título',
    });
    state = applyHeaderControlAction(page, state, {
      type: 'set-text',
      field: 'artist',
      value: 'Novo artista',
    });
    state = applyHeaderControlAction(page, state, {
      type: 'set-text',
      field: 'composer',
      value: 'Nova autoria',
    });

    expect(page.getTitle()?.textContent).toBe('Novo título');
    expect(page.getArtist()?.textContent).toBe('Novo artista');
    expect(page.getComposer()?.textContent).toBe('Composição de: Nova autoria');
    expect(page.getTitle()?.parentElement).toBe(titleLink);
    expect(page.getArtist()?.parentElement).toBe(artistLink);
    expect(state.composer?.value).toBe('Nova autoria');
  });

  it('permite compositor vazio preservando o prefixo estrutural', () => {
    const page = new CifraClubPage(parseHtml(fullPageHtml));
    const state = applyHeaderControlAction(page, readHeaderControlState(page), {
      type: 'set-text',
      field: 'composer',
      value: '',
    });

    expect(page.getComposer()?.textContent).toBe('Composição de:');
    expect(state.composer?.value).toBe('');
  });

  it('altera visibilidades individualmente e reconsulta alvos substituídos', () => {
    const document = parseHtml(fullPageHtml);
    const page = new CifraClubPage(document);
    let state = readHeaderControlState(page);

    state = applyHeaderControlAction(page, state, {
      type: 'set-visibility',
      target: 'title',
      visible: false,
    });
    state = applyHeaderControlAction(page, state, {
      type: 'set-visibility',
      target: 'brand',
      visible: false,
    });

    expect(page.getTitle()?.hidden).toBe(true);
    expect(page.getBrand()?.hidden).toBe(true);
    expect(state.title?.visible).toBe(false);
    expect(state.brand?.visible).toBe(false);

    const replacement = document.createElement('h1');
    replacement.textContent = 'Substituído externamente';
    page.getTitle()?.replaceWith(replacement);
    state = applyHeaderControlAction(page, state, {
      type: 'set-text',
      field: 'title',
      value: 'Alvo reconsultado',
    });

    expect(replacement.textContent).toBe('Alvo reconsultado');
    expect(state.title?.value).toBe('Alvo reconsultado');
  });

  it('compacta e descompacta sem consumir texto, visibilidade ou estilos externos', () => {
    const document = parseHtml(fullPageHtml);
    const page = new CifraClubPage(document);
    const header = page.getHeader();
    const title = page.getTitle();
    let state = readHeaderControlState(page);

    if (!header || !title) {
      throw new Error('Fixture sem cabeçalho completo');
    }

    header.style.setProperty('padding-left', '3px');
    state = applyHeaderControlAction(page, state, {
      type: 'set-text',
      field: 'title',
      value: 'Título alterado',
    });
    state = applyHeaderControlAction(page, state, {
      type: 'set-visibility',
      target: 'title',
      visible: false,
    });
    state = applyHeaderControlAction(page, state, { type: 'set-compact', compact: true });

    expect(header.style.getPropertyValue('gap')).toBe('0px');
    expect(header.style.getPropertyValue('margin-bottom')).toBe('16px');
    expect(title.style.getPropertyValue('font-size')).toBe('16px');
    expect(title.style.getPropertyValue('line-height')).toBe('22px');
    expect(state.compact).toBe(true);

    state = applyHeaderControlAction(page, state, { type: 'set-compact', compact: false });
    state = applyHeaderControlAction(page, state, { type: 'set-compact', compact: false });

    expect(header.style.getPropertyValue('gap')).toBe('');
    expect(header.style.getPropertyValue('margin-bottom')).toBe('');
    expect(header.style.getPropertyValue('padding-left')).toBe('3px');
    expect(title.textContent).toBe('Título alterado');
    expect(title.hidden).toBe(true);
    expect(state.compact).toBe(false);

    restoreAll();

    expect(title.textContent).toBe('Canção de Teste');
    expect(title.hidden).toBe(false);
    expect(header.style.getPropertyValue('padding-left')).toBe('3px');
  });
});

import { afterEach, describe, expect, it } from 'vitest';
import {
  restore,
  restoreAll,
  setEditable,
  setStyles,
  setText,
  setVisible,
} from '../../src/dom/mutations';

afterEach(() => {
  restoreAll();
});

describe('mutações reversíveis do DOM', () => {
  it('restaura o primeiro texto após alterações consecutivas', () => {
    const element = document.createElement('h1');
    element.textContent = 'Original';

    setText(element, 'Primeira alteração');
    setText(element, 'Segunda alteração');
    restore(element);

    expect(element.textContent).toBe('Original');
  });

  it('restaura a visibilidade sem presumir o display original', () => {
    const visibleElement = document.createElement('div');
    const hiddenElement = document.createElement('div');
    hiddenElement.setAttribute('hidden', 'until-found');

    setVisible(visibleElement, false);
    setVisible(hiddenElement, true);

    expect(visibleElement.hasAttribute('hidden')).toBe(true);
    expect(hiddenElement.hasAttribute('hidden')).toBe(false);

    restore(visibleElement);
    restore(hiddenElement);

    expect(visibleElement.hasAttribute('hidden')).toBe(false);
    expect(hiddenElement.getAttribute('hidden')).toBe('until-found');
  });

  it('restaura o atributo contenteditable anterior', () => {
    const plainElement = document.createElement('pre');
    const editableElement = document.createElement('pre');
    editableElement.setAttribute('contenteditable', 'plaintext-only');

    setEditable(plainElement, true);
    setEditable(editableElement, false);

    expect(plainElement.getAttribute('contenteditable')).toBe('true');
    expect(editableElement.getAttribute('contenteditable')).toBe('false');

    restore(plainElement);
    restore(editableElement);

    expect(plainElement.hasAttribute('contenteditable')).toBe(false);
    expect(editableElement.getAttribute('contenteditable')).toBe('plaintext-only');
  });

  it('restaura somente os estilos alterados e suas prioridades', () => {
    const element = document.createElement('div');
    element.style.setProperty('color', 'red', 'important');
    element.style.setProperty('padding', '4px');

    setStyles(element, {
      color: 'blue',
      'margin-top': '8px',
      padding: null,
    });
    element.style.setProperty('background-color', 'black');

    restore(element);

    expect(element.style.getPropertyValue('color')).toBe('red');
    expect(element.style.getPropertyPriority('color')).toBe('important');
    expect(element.style.getPropertyValue('padding')).toBe('4px');
    expect(element.style.getPropertyValue('margin-top')).toBe('');
    expect(element.style.getPropertyValue('background-color')).toBe('black');
  });

  it('preserva a existência original do atributo style', () => {
    const withoutStyle = document.createElement('div');
    const withEmptyStyle = document.createElement('div');
    withEmptyStyle.setAttribute('style', '');

    setStyles(withoutStyle, { opacity: '0.5' });
    setStyles(withEmptyStyle, { opacity: '0.5' });
    restore(withoutStyle);
    restore(withEmptyStyle);

    expect(withoutStyle.hasAttribute('style')).toBe(false);
    expect(withEmptyStyle.hasAttribute('style')).toBe(true);
    expect(withEmptyStyle.getAttribute('style')).toBe('');
  });

  it('consome o snapshot em restore e captura uma nova sessão', () => {
    const element = document.createElement('h1');
    element.textContent = 'Original';

    setText(element, 'Alterado');
    restore(element);
    element.textContent = 'Nova base';
    restore(element);

    expect(element.textContent).toBe('Nova base');

    setText(element, 'Nova alteração');
    restore(element);
    restore(element);

    expect(element.textContent).toBe('Nova base');
  });

  it('consome todos os snapshots em restoreAll', () => {
    const title = document.createElement('h1');
    const artist = document.createElement('h2');
    title.textContent = 'Título original';
    artist.textContent = 'Artista original';

    setText(title, 'Título alterado');
    setText(artist, 'Artista alterado');
    restoreAll();

    expect(title.textContent).toBe('Título original');
    expect(artist.textContent).toBe('Artista original');

    title.textContent = 'Título externo';
    artist.textContent = 'Artista externo';
    restoreAll();

    expect(title.textContent).toBe('Título externo');
    expect(artist.textContent).toBe('Artista externo');
  });

  it('restaura com segurança um elemento removido do documento', () => {
    const element = document.createElement('p');
    element.textContent = 'Original';
    document.body.append(element);
    setText(element, 'Alterado');
    element.remove();

    restoreAll();

    expect(element.isConnected).toBe(false);
    expect(element.textContent).toBe('Original');
  });

  it('não registra operações que já estão no estado solicitado', () => {
    const element = document.createElement('p');
    element.textContent = 'Estável';

    setText(element, 'Estável');
    setVisible(element, true);
    setStyles(element, { display: null });
    element.textContent = 'Alteração externa';
    restoreAll();

    expect(element.textContent).toBe('Alteração externa');
    expect(element.hasAttribute('hidden')).toBe(false);
    expect(element.hasAttribute('style')).toBe(false);
  });
});

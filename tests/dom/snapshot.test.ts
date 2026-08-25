import { describe, expect, it } from 'vitest';
import { type Snapshot, SnapshotRegistry } from '../../src/dom/snapshot';

function requireSnapshot(registry: SnapshotRegistry, element: Element): Snapshot {
  const snapshot = registry.get(element);

  if (!snapshot) {
    throw new Error('Snapshot não encontrado');
  }

  return snapshot;
}

describe('SnapshotRegistry', () => {
  it('captura somente o texto solicitado', () => {
    const element = document.createElement('h1');
    const registry = new SnapshotRegistry();
    element.textContent = 'Título original';

    registry.captureText(element);

    const snapshot = requireSnapshot(registry, element);
    expect(snapshot.textContent).toBe('Título original');
    expect(snapshot.attributes).toEqual(new Map());
    expect(snapshot.styles).toEqual(new Map());
    expect(snapshot).not.toHaveProperty('hadStyleAttribute');
  });

  it('distingue atributos existentes, vazios e ausentes', () => {
    const element = document.createElement('div');
    const registry = new SnapshotRegistry();
    element.setAttribute('data-value', 'original');
    element.setAttribute('data-empty', '');

    registry.captureAttribute(element, 'data-value');
    registry.captureAttribute(element, 'data-empty');
    registry.captureAttribute(element, 'data-missing');

    const snapshot = requireSnapshot(registry, element);
    expect(snapshot.attributes).toEqual(
      new Map([
        ['data-value', 'original'],
        ['data-empty', ''],
        ['data-missing', null],
      ]),
    );
    expect(snapshot).not.toHaveProperty('textContent');
    expect(snapshot.styles).toEqual(new Map());
  });

  it('captura existência, valor e prioridade de estilos isolados', () => {
    const styledElement = document.createElement('div');
    const plainElement = document.createElement('div');
    const registry = new SnapshotRegistry();
    styledElement.style.setProperty('color', 'red', 'important');

    registry.captureStyle(styledElement, 'color');
    registry.captureStyle(styledElement, 'margin-top');
    registry.captureStyle(plainElement, 'gap');

    expect(requireSnapshot(registry, styledElement)).toMatchObject({
      hadStyleAttribute: true,
      styles: new Map([
        ['color', { existed: true, value: 'red', priority: 'important' }],
        ['margin-top', { existed: false, value: '', priority: '' }],
      ]),
    });
    expect(requireSnapshot(registry, plainElement)).toMatchObject({
      hadStyleAttribute: false,
      styles: new Map([['gap', { existed: false, value: '', priority: '' }]]),
    });
  });

  it('agrega capturas diferentes no mesmo snapshot', () => {
    const element = document.createElement('p');
    const registry = new SnapshotRegistry();
    element.textContent = 'Texto';
    element.setAttribute('contenteditable', 'false');
    element.style.setProperty('display', 'block');

    registry.captureText(element);
    registry.captureAttribute(element, 'contenteditable');
    registry.captureStyle(element, 'display');

    expect(registry.size).toBe(1);
    expect(requireSnapshot(registry, element)).toMatchObject({
      textContent: 'Texto',
      hadStyleAttribute: true,
      attributes: new Map([['contenteditable', 'false']]),
      styles: new Map([['display', { existed: true, value: 'block', priority: '' }]]),
    });
  });

  it('preserva a primeira captura após alterações posteriores', () => {
    const element = document.createElement('p');
    const registry = new SnapshotRegistry();
    element.textContent = 'Primeiro texto';
    element.setAttribute('data-state', 'first');
    element.style.setProperty('display', 'block');

    registry.captureText(element);
    registry.captureAttribute(element, 'data-state');
    registry.captureStyle(element, 'display');
    element.textContent = 'Segundo texto';
    element.setAttribute('data-state', 'second');
    element.style.setProperty('display', 'none');
    registry.captureText(element);
    registry.captureAttribute(element, 'data-state');
    registry.captureStyle(element, 'display');

    expect(requireSnapshot(registry, element)).toMatchObject({
      textContent: 'Primeiro texto',
      attributes: new Map([['data-state', 'first']]),
      styles: new Map([['display', { existed: true, value: 'block', priority: '' }]]),
    });
  });

  it('mantém registros independentes e enumeráveis por elemento', () => {
    const firstElement = document.createElement('h1');
    const secondElement = document.createElement('h2');
    const registry = new SnapshotRegistry();

    registry.captureText(firstElement);
    registry.captureAttribute(secondElement, 'hidden');

    const entries = Array.from(registry.entries());
    expect(registry.size).toBe(2);
    expect(entries.map(([element]) => element)).toEqual([firstElement, secondElement]);
    expect(entries[0]?.[1]).toBe(registry.get(firstElement));
    expect(entries[1]?.[1]).toBe(registry.get(secondElement));
  });

  it('remove registros individualmente e limpa a sessão de forma idempotente', () => {
    const firstElement = document.createElement('h1');
    const secondElement = document.createElement('h2');
    const registry = new SnapshotRegistry();
    registry.captureText(firstElement);
    registry.captureText(secondElement);

    expect(registry.delete(firstElement)).toBe(true);
    expect(registry.delete(firstElement)).toBe(false);
    expect(registry.size).toBe(1);

    registry.clear();
    registry.clear();

    expect(registry.size).toBe(0);
    expect(Array.from(registry.entries())).toEqual([]);
  });
});

import { type Snapshot, SnapshotRegistry, type StyleSnapshot } from './snapshot';

export type StyleChanges = Readonly<Record<string, string | null>>;
export type EditableValue = boolean | 'plaintext-only';

const snapshots = new SnapshotRegistry();

export function setText(element: Element, value: string): void {
  if (element.textContent === value) {
    return;
  }

  snapshots.captureText(element);
  element.textContent = value;
}

export function setVisible(element: HTMLElement, visible: boolean): void {
  const hidden = !visible;

  if (element.hasAttribute('hidden') === hidden) {
    return;
  }

  snapshots.captureAttribute(element, 'hidden');
  element.toggleAttribute('hidden', hidden);
}

export function captureChildNodes(element: Element): void {
  snapshots.captureChildNodes(element);
}

export function setEditable(element: HTMLElement, editable: EditableValue): void {
  const value = typeof editable === 'boolean' ? String(editable) : editable;

  if (element.getAttribute('contenteditable') === value) {
    return;
  }

  snapshots.captureAttribute(element, 'contenteditable');
  element.setAttribute('contenteditable', value);
}

export function restoreAttribute(element: Element, name: string): boolean {
  const snapshot = snapshots.get(element);
  const value = snapshot?.attributes.get(name);

  if (!snapshot?.attributes.has(name)) {
    return false;
  }

  if (value === null) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value ?? '');
  }

  snapshot.attributes.delete(name);
  deleteSnapshotIfEmpty(element, snapshot);
  return true;
}

export function setStyles(element: HTMLElement, styles: StyleChanges): void {
  for (const [property, value] of Object.entries(styles)) {
    const propertyExists = Array.from(element.style).includes(property);

    if (value === null) {
      if (!propertyExists) {
        continue;
      }

      snapshots.captureStyle(element, property);
      element.style.removeProperty(property);
      continue;
    }

    if (
      propertyExists &&
      element.style.getPropertyValue(property) === value &&
      element.style.getPropertyPriority(property) === ''
    ) {
      continue;
    }

    snapshots.captureStyle(element, property);
    element.style.setProperty(property, value);
  }
}

export function restore(element: Element): void {
  const snapshot = snapshots.get(element);

  if (!snapshot) {
    return;
  }

  restoreContent(element, snapshot);
  restoreAttributes(element, snapshot);
  restoreCapturedStyles(element as HTMLElement, snapshot);
  snapshots.delete(element);
}

export function restoreStyles(element: HTMLElement, properties: readonly string[]): void {
  const snapshot = snapshots.get(element);

  if (!snapshot) {
    return;
  }

  for (const property of properties) {
    const style = snapshot.styles.get(property);

    if (!style) {
      continue;
    }

    restoreCapturedStyle(element, property, style);
    snapshot.styles.delete(property);
  }

  removeEmptyStyleAttribute(element, snapshot);

  deleteSnapshotIfEmpty(element, snapshot);
}

export function restoreAll(): void {
  for (const [element] of Array.from(snapshots.entries())) {
    restore(element);
  }

  snapshots.clear();
}

function restoreContent(element: Element, snapshot: Snapshot): void {
  if ('childNodes' in snapshot) {
    const originalChildNodes = snapshot.childNodes ?? [];
    const currentChildNodes = Array.from(element.childNodes);
    const unchanged =
      currentChildNodes.length === originalChildNodes.length &&
      currentChildNodes.every((node, index) => node.isEqualNode(originalChildNodes[index] ?? null));

    if (!unchanged) {
      element.replaceChildren(...originalChildNodes.map((node) => node.cloneNode(true)));
    }
    return;
  }

  if ('textContent' in snapshot) {
    element.textContent = snapshot.textContent ?? null;
  }
}

function deleteSnapshotIfEmpty(element: Element, snapshot: Snapshot): void {
  if (
    !('textContent' in snapshot) &&
    !('childNodes' in snapshot) &&
    snapshot.attributes.size === 0 &&
    snapshot.styles.size === 0
  ) {
    snapshots.delete(element);
  }
}

function restoreAttributes(element: Element, snapshot: Snapshot): void {
  for (const [name, value] of snapshot.attributes) {
    if (value === null) {
      element.removeAttribute(name);
    } else {
      element.setAttribute(name, value);
    }
  }
}

function restoreCapturedStyles(element: HTMLElement, snapshot: Snapshot): void {
  for (const [property, style] of snapshot.styles) {
    restoreCapturedStyle(element, property, style);
  }

  removeEmptyStyleAttribute(element, snapshot);
}

function restoreCapturedStyle(element: HTMLElement, property: string, style: StyleSnapshot): void {
  if (style.existed) {
    element.style.setProperty(property, style.value, style.priority);
  } else {
    element.style.removeProperty(property);
  }
}

function removeEmptyStyleAttribute(element: HTMLElement, snapshot: Snapshot): void {
  if (snapshot.hadStyleAttribute === false && element.getAttribute('style') === '') {
    element.removeAttribute('style');
  }
}

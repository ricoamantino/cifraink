import { type Snapshot, SnapshotRegistry } from './snapshot';

export type StyleChanges = Readonly<Record<string, string | null>>;

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

export function setEditable(element: HTMLElement, editable: boolean): void {
  const value = String(editable);

  if (element.getAttribute('contenteditable') === value) {
    return;
  }

  snapshots.captureAttribute(element, 'contenteditable');
  element.setAttribute('contenteditable', value);
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

  restoreText(element, snapshot);
  restoreAttributes(element, snapshot);
  restoreStyles(element as HTMLElement, snapshot);
  snapshots.delete(element);
}

export function restoreAll(): void {
  for (const [element] of Array.from(snapshots.entries())) {
    restore(element);
  }

  snapshots.clear();
}

function restoreText(element: Element, snapshot: Snapshot): void {
  if ('textContent' in snapshot) {
    element.textContent = snapshot.textContent ?? null;
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

function restoreStyles(element: HTMLElement, snapshot: Snapshot): void {
  for (const [property, style] of snapshot.styles) {
    if (style.existed) {
      element.style.setProperty(property, style.value, style.priority);
    } else {
      element.style.removeProperty(property);
    }
  }

  if (snapshot.hadStyleAttribute === false && element.getAttribute('style') === '') {
    element.removeAttribute('style');
  }
}

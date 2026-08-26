export interface StyleSnapshot {
  readonly existed: boolean;
  readonly value: string;
  readonly priority: string;
}

export interface Snapshot {
  textContent?: string | null;
  childNodes?: readonly Node[];
  hadStyleAttribute?: boolean;
  readonly attributes: Map<string, string | null>;
  readonly styles: Map<string, StyleSnapshot>;
}

export class SnapshotRegistry {
  private readonly snapshots = new Map<Element, Snapshot>();

  get size(): number {
    return this.snapshots.size;
  }

  captureText(element: Element): void {
    const snapshot = this.getOrCreate(element);

    if (!('textContent' in snapshot)) {
      snapshot.textContent = element.textContent;
    }
  }

  captureAttribute(element: Element, name: string): void {
    const snapshot = this.getOrCreate(element);

    if (!snapshot.attributes.has(name)) {
      snapshot.attributes.set(name, element.getAttribute(name));
    }
  }

  captureChildNodes(element: Element): void {
    const snapshot = this.getOrCreate(element);

    if (!('childNodes' in snapshot)) {
      snapshot.childNodes = Array.from(element.childNodes, (node) => node.cloneNode(true));
    }
  }

  captureStyle(element: HTMLElement, property: string): void {
    const snapshot = this.getOrCreate(element);

    if (!('hadStyleAttribute' in snapshot)) {
      snapshot.hadStyleAttribute = element.hasAttribute('style');
    }

    if (snapshot.styles.has(property)) {
      return;
    }

    snapshot.styles.set(property, {
      existed: Array.from(element.style).includes(property),
      value: element.style.getPropertyValue(property),
      priority: element.style.getPropertyPriority(property),
    });
  }

  get(element: Element): Snapshot | undefined {
    return this.snapshots.get(element);
  }

  entries(): IterableIterator<[Element, Snapshot]> {
    return this.snapshots.entries();
  }

  delete(element: Element): boolean {
    return this.snapshots.delete(element);
  }

  clear(): void {
    this.snapshots.clear();
  }

  private getOrCreate(element: Element): Snapshot {
    const existingSnapshot = this.snapshots.get(element);

    if (existingSnapshot) {
      return existingSnapshot;
    }

    const snapshot: Snapshot = {
      attributes: new Map(),
      styles: new Map(),
    };
    this.snapshots.set(element, snapshot);
    return snapshot;
  }
}

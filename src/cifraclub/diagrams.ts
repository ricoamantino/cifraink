import { setText, setVisible } from '../dom/mutations';
import type { CifraClubPage } from './page';

export interface DiagramItemControlState {
  readonly index: number;
  readonly label: string;
  readonly markingsAvailable: boolean;
  readonly markingsVisible: boolean;
  readonly name: string | null;
  readonly visible: boolean;
}

export interface DiagramControlState {
  readonly available: boolean;
  readonly items: readonly DiagramItemControlState[];
}

export type DiagramControlAction =
  | {
      readonly type: 'set-diagram-visible';
      readonly index: number;
      readonly visible: boolean;
    }
  | {
      readonly type: 'set-diagram-markings-visible';
      readonly index: number;
      readonly visible: boolean;
    }
  | {
      readonly type: 'set-diagram-name';
      readonly index: number;
      readonly value: string;
    };

export function readDiagramControlState(page: CifraClubPage): DiagramControlState {
  const section = page.getChordDiagramSection();
  const entries = page.getChordDiagramEntries();

  return {
    available: section !== null && entries.length > 0,
    items: createItemStates(entries),
  };
}

export function applyDiagramControlAction(
  page: CifraClubPage,
  action: DiagramControlAction,
): DiagramControlState {
  const entry = page.getChordDiagramEntries()[action.index];

  if (entry) {
    if (action.type === 'set-diagram-visible') {
      setVisible(entry.visibilityTarget, action.visible);
    } else if (action.type === 'set-diagram-markings-visible') {
      for (const target of entry.markingTargets) {
        setVisible(target, action.visible);
      }
    } else if (entry.nameElement) {
      setText(entry.nameElement, action.value);
    }
  }

  return readDiagramControlState(page);
}

function createItemStates(
  entries: ReturnType<CifraClubPage['getChordDiagramEntries']>,
): DiagramItemControlState[] {
  const nameCounts = new Map<string, number>();

  for (const entry of entries) {
    if (entry.name) {
      nameCounts.set(entry.name, (nameCounts.get(entry.name) ?? 0) + 1);
    }
  }

  const occurrences = new Map<string, number>();

  return entries.map((entry, index) => {
    const name = entry.name;
    let label = `Diagrama ${index + 1}`;

    if (name) {
      const occurrence = (occurrences.get(name) ?? 0) + 1;
      occurrences.set(name, occurrence);
      label = (nameCounts.get(name) ?? 0) > 1 ? `${name} (${occurrence})` : name;
    }

    return {
      index,
      label,
      markingsAvailable: entry.markingTargets.length > 0,
      markingsVisible:
        entry.markingTargets.length > 0 && entry.markingTargets.every((target) => !target.hidden),
      name: entry.nameElement?.textContent ?? null,
      visible: !entry.visibilityTarget.hidden,
    };
  });
}

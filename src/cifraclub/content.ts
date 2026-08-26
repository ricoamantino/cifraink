import { captureChildNodes, restoreAttribute, setEditable } from '../dom/mutations';
import type { CifraClubPage } from './page';

export interface ContentControlState {
  readonly available: boolean;
  readonly editable: boolean;
}

export type ContentControlAction = {
  readonly type: 'set-editable';
  readonly editable: boolean;
};

export function readContentControlState(page: CifraClubPage): ContentControlState {
  const blocks = page.getContentBlocks();

  return {
    available: blocks.length > 0,
    editable: blocks.length > 0 && blocks.every(isEditable),
  };
}

export function applyContentControlAction(
  page: CifraClubPage,
  action: ContentControlAction,
): ContentControlState {
  const blocks = page.getContentBlocks();

  for (const block of blocks) {
    if (action.editable) {
      captureChildNodes(block);
      setEditable(block, 'plaintext-only');
    } else {
      restoreAttribute(block, 'contenteditable');
    }
  }

  return readContentControlState(page);
}

function isEditable(element: HTMLElement): boolean {
  const value = element.getAttribute('contenteditable')?.toLowerCase();
  return value === '' || value === 'true' || value === 'plaintext-only';
}

import { restoreStyles, setStyles, setText, setVisible } from '../dom/mutations';
import type { CifraClubPage } from './page';
import { cifraClubText } from './selectors';

export type HeaderTextField = 'title' | 'artist' | 'composer';
export type HeaderVisibilityTarget = HeaderTextField | 'brand';

export interface HeaderTextControlState {
  readonly value: string;
  readonly visible: boolean;
}

export interface HeaderVisibilityControlState {
  readonly visible: boolean;
}

export interface HeaderControlState {
  readonly title: HeaderTextControlState | null;
  readonly artist: HeaderTextControlState | null;
  readonly composer: HeaderTextControlState | null;
  readonly brand: HeaderVisibilityControlState | null;
  readonly compact: boolean;
  readonly compactAvailable: boolean;
}

export type HeaderControlAction =
  | { readonly type: 'set-text'; readonly field: HeaderTextField; readonly value: string }
  | {
      readonly type: 'set-visibility';
      readonly target: HeaderVisibilityTarget;
      readonly visible: boolean;
    }
  | { readonly type: 'set-compact'; readonly compact: boolean };

const compactHeaderStyles = {
  gap: '0px',
  'margin-bottom': '16px',
} as const;

const compactHeadingStyles = {
  'font-size': '16px',
  'line-height': '22px',
} as const;

const compactComposerStyles = {
  'margin-top': '4px',
} as const;

export function readHeaderControlState(page: CifraClubPage, compact = false): HeaderControlState {
  const header = page.getHeader();

  return {
    title: readTextControl(page.getTitle()),
    artist: readTextControl(page.getArtist()),
    composer: readTextControl(page.getComposer(), true),
    brand: readVisibilityControl(page.getBrand()),
    compact: header ? compact : false,
    compactAvailable: header !== null,
  };
}

export function applyHeaderControlAction(
  page: CifraClubPage,
  current: HeaderControlState,
  action: HeaderControlAction,
): HeaderControlState {
  if (action.type === 'set-text') {
    const element = getTextElement(page, action.field);

    if (element) {
      setText(element, formatText(action.field, action.value));
    }

    return readHeaderControlState(page, current.compact);
  }

  if (action.type === 'set-visibility') {
    const element = getVisibilityElement(page, action.target);

    if (element) {
      setVisible(element, action.visible);
    }

    return readHeaderControlState(page, current.compact);
  }

  setCompact(page, action.compact);
  return readHeaderControlState(page, action.compact);
}

export function hasHeaderControls(state: HeaderControlState): boolean {
  return (
    state.compactAvailable ||
    state.title !== null ||
    state.artist !== null ||
    state.composer !== null ||
    state.brand !== null
  );
}

function readTextControl(
  element: HTMLElement | null,
  composer = false,
): HeaderTextControlState | null {
  if (!element) {
    return null;
  }

  const text = element.textContent ?? '';

  return {
    value: composer ? readComposerValue(text) : text,
    visible: !element.hidden,
  };
}

function readVisibilityControl(element: HTMLElement | null): HeaderVisibilityControlState | null {
  return element ? { visible: !element.hidden } : null;
}

function readComposerValue(text: string): string {
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  return normalizedText.slice(cifraClubText.composerPrefix.length).trimStart();
}

function formatText(field: HeaderTextField, value: string): string {
  if (field !== 'composer') {
    return value;
  }

  return value ? `${cifraClubText.composerPrefix} ${value}` : cifraClubText.composerPrefix;
}

function getTextElement(page: CifraClubPage, field: HeaderTextField): HTMLElement | null {
  switch (field) {
    case 'title':
      return page.getTitle();
    case 'artist':
      return page.getArtist();
    case 'composer':
      return page.getComposer();
  }
}

function getVisibilityElement(
  page: CifraClubPage,
  target: HeaderVisibilityTarget,
): HTMLElement | null {
  return target === 'brand' ? page.getBrand() : getTextElement(page, target);
}

function setCompact(page: CifraClubPage, compact: boolean): void {
  setCompactStyles(page.getHeader(), compactHeaderStyles, compact);
  setCompactStyles(page.getTitle(), compactHeadingStyles, compact);
  setCompactStyles(page.getArtist(), compactHeadingStyles, compact);
  setCompactStyles(page.getComposer(), compactComposerStyles, compact);
}

function setCompactStyles(
  element: HTMLElement | null,
  styles: Readonly<Record<string, string>>,
  compact: boolean,
): void {
  if (!element) {
    return;
  }

  if (compact) {
    setStyles(element, styles);
  } else {
    restoreStyles(element, Object.keys(styles));
  }
}

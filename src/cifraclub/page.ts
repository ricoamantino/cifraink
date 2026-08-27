import { assessPageCapabilities, type PageCapabilities } from './capabilities';
import { cifraClubSelectors, cifraClubText } from './selectors';

export interface ChordDiagramEntry {
  readonly diagram: HTMLElement;
  readonly name: string | null;
  readonly visibilityTarget: HTMLElement;
}

export class CifraClubPage {
  constructor(private readonly document: Document) {}

  inspect(): PageCapabilities {
    const chordDiagrams = this.getChordDiagrams();

    return assessPageCapabilities({
      printRoot: this.getPrintRoot() !== null,
      title: this.getTitle() !== null,
      artist: this.getArtist() !== null,
      composer: this.getComposer() !== null,
      content: this.getContentBlocks().length > 0,
      chordDiagrams: chordDiagrams.length > 0 && this.getChordDiagramSection() !== null,
      brand: this.getBrand() !== null,
    });
  }

  getTitle(): HTMLElement | null {
    return this.getHeader()?.querySelector<HTMLElement>(cifraClubSelectors.title) ?? null;
  }

  getArtist(): HTMLElement | null {
    return this.getHeader()?.querySelector<HTMLElement>(cifraClubSelectors.artist) ?? null;
  }

  getTitleVisibilityTarget(): HTMLElement | null {
    return this.getHeaderTextVisibilityTarget(this.getTitle());
  }

  getArtistVisibilityTarget(): HTMLElement | null {
    return this.getHeaderTextVisibilityTarget(this.getArtist());
  }

  getComposer(): HTMLElement | null {
    const candidates = this.getHeader()?.querySelectorAll<HTMLElement>(
      cifraClubSelectors.composerCandidate,
    );

    if (!candidates) {
      return null;
    }

    return (
      Array.from(candidates).find((candidate) => {
        const normalizedText = candidate.textContent?.replace(/\s+/g, ' ').trim();
        return normalizedText?.startsWith(cifraClubText.composerPrefix);
      }) ?? null
    );
  }

  getToneRow(): HTMLElement | null {
    return this.getChordConfigRow(cifraClubSelectors.toneValue);
  }

  getTuningRow(): HTMLElement | null {
    return this.getChordConfigRow(cifraClubSelectors.tuningValue);
  }

  getContentBlocks(): HTMLElement[] {
    return this.getPages().flatMap((page) =>
      Array.from(page.querySelectorAll<HTMLElement>(cifraClubSelectors.content)),
    );
  }

  getChordDiagramSection(): HTMLElement | null {
    const firstDiagram = this.getChordDiagrams()[0];

    if (!firstDiagram) {
      return null;
    }

    const section = firstDiagram.closest<HTMLElement>(cifraClubSelectors.page);
    return section && this.getPages().includes(section) ? section : null;
  }

  getChordDiagrams(): HTMLElement[] {
    return this.getPages().flatMap((page) =>
      Array.from(page.querySelectorAll<HTMLElement>(cifraClubSelectors.chordDiagram)),
    );
  }

  getChordDiagramEntries(): ChordDiagramEntry[] {
    const section = this.getChordDiagramSection();

    if (!section) {
      return [];
    }

    return this.getChordDiagrams().map((diagram) => {
      const item = diagram.closest<HTMLElement>(cifraClubSelectors.chordDiagramItem);
      const normalizedName = diagram
        .querySelector<HTMLElement>(cifraClubSelectors.chordDiagramName)
        ?.textContent?.replace(/\s+/g, ' ')
        .trim();

      return {
        diagram,
        name: normalizedName || null,
        visibilityTarget: item && section.contains(item) ? item : diagram,
      };
    });
  }

  getBrand(): HTMLElement | null {
    return this.getHeader()?.querySelector<HTMLElement>(cifraClubSelectors.brand) ?? null;
  }

  getNativeControls(): HTMLElement | null {
    const printRoot = this.getPrintRoot();

    return (
      printRoot?.parentElement?.querySelector<HTMLElement>(cifraClubSelectors.nativeControls) ??
      null
    );
  }

  getHeader(): HTMLElement | null {
    for (const page of this.getPages()) {
      const header = page.querySelector<HTMLElement>(cifraClubSelectors.header);

      if (header) {
        return header;
      }
    }

    return null;
  }

  private getPrintRoot(): HTMLElement | null {
    return this.document.querySelector<HTMLElement>(cifraClubSelectors.printRoot);
  }

  private getChordConfigRow(valueSelector: string): HTMLElement | null {
    for (const page of this.getPages()) {
      const config = page.querySelector<HTMLElement>(cifraClubSelectors.chordConfig);
      const value = config?.querySelector<HTMLElement>(valueSelector);
      const row = value?.parentElement;

      if (config && row?.parentElement === config) {
        return row;
      }
    }

    return null;
  }

  private getHeaderTextVisibilityTarget(element: HTMLElement | null): HTMLElement | null {
    const header = this.getHeader();
    const parent = element?.parentElement;

    return parent?.tagName === 'A' && parent.parentElement === header ? parent : element;
  }

  private getPages(): HTMLElement[] {
    const printRoot = this.getPrintRoot();

    if (!printRoot) {
      return [];
    }

    const directChildren = Array.from(printRoot.children);
    const directPages = directChildren.filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.matches(cifraClubSelectors.page),
    );

    if (directPages.length > 0) {
      return directPages;
    }

    const wrapper = directChildren.length === 1 ? directChildren[0] : undefined;
    return wrapper
      ? Array.from(wrapper.children).filter(
          (page): page is HTMLElement =>
            page instanceof HTMLElement && page.matches(cifraClubSelectors.page),
        )
      : [];
  }
}

import { assessPageCapabilities, type PageCapabilities } from './capabilities';
import { cifraClubSelectors, cifraClubText } from './selectors';

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

  getContentBlocks(): HTMLElement[] {
    return this.getPages().flatMap((page) =>
      Array.from(page.querySelectorAll<HTMLElement>(cifraClubSelectors.content)),
    );
  }

  getChordDiagramSection(): HTMLElement | null {
    const printRoot = this.getPrintRoot();
    const firstDiagram = this.getChordDiagrams()[0];

    if (!printRoot || !firstDiagram) {
      return null;
    }

    const section = firstDiagram.closest<HTMLElement>(cifraClubSelectors.page);
    return section?.parentElement === printRoot ? section : null;
  }

  getChordDiagrams(): HTMLElement[] {
    const printRoot = this.getPrintRoot();

    return printRoot
      ? Array.from(printRoot.querySelectorAll<HTMLElement>(cifraClubSelectors.chordDiagram))
      : [];
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

  private getPages(): HTMLElement[] {
    const printRoot = this.getPrintRoot();

    if (!printRoot) {
      return [];
    }

    return Array.from(printRoot.children).filter((child): child is HTMLElement =>
      child.matches(cifraClubSelectors.page),
    );
  }
}

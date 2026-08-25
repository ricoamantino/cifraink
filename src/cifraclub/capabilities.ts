export type PageCompatibility = 'compatible' | 'partial' | 'incompatible';

export interface PageCapabilities {
  readonly status: PageCompatibility;
  readonly printRoot: boolean;
  readonly title: boolean;
  readonly artist: boolean;
  readonly composer: boolean;
  readonly content: boolean;
  readonly chordDiagrams: boolean;
  readonly brand: boolean;
}

export type PageCapabilityPresence = Omit<PageCapabilities, 'status'>;

const optionalCapabilities = [
  'title',
  'artist',
  'composer',
  'chordDiagrams',
  'brand',
] as const satisfies readonly (keyof PageCapabilityPresence)[];

export function assessPageCapabilities(presence: PageCapabilityPresence): PageCapabilities {
  if (!presence.printRoot || !presence.content) {
    return { status: 'incompatible', ...presence };
  }

  const hasAllOptionalCapabilities = optionalCapabilities.every(
    (capability) => presence[capability],
  );

  return {
    status: hasAllOptionalCapabilities ? 'compatible' : 'partial',
    ...presence,
  };
}

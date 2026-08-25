import { describe, expect, it } from 'vitest';
import {
  assessPageCapabilities,
  type PageCapabilityPresence,
  type PageCompatibility,
} from '../../src/cifraclub/capabilities';

const completePresence: PageCapabilityPresence = {
  printRoot: true,
  title: true,
  artist: true,
  composer: true,
  content: true,
  chordDiagrams: true,
  brand: true,
};

const scenarios: Array<{
  expectedStatus: PageCompatibility;
  name: string;
  presence: PageCapabilityPresence;
}> = [
  {
    expectedStatus: 'compatible',
    name: 'página completa',
    presence: completePresence,
  },
  {
    expectedStatus: 'partial',
    name: 'sem compositor',
    presence: { ...completePresence, composer: false },
  },
  {
    expectedStatus: 'partial',
    name: 'sem diagramas',
    presence: { ...completePresence, chordDiagrams: false },
  },
  {
    expectedStatus: 'partial',
    name: 'sem marca',
    presence: { ...completePresence, brand: false },
  },
  {
    expectedStatus: 'incompatible',
    name: 'sem conteúdo musical',
    presence: { ...completePresence, content: false },
  },
  {
    expectedStatus: 'incompatible',
    name: 'sem raiz de impressão',
    presence: { ...completePresence, printRoot: false },
  },
];

describe.each(scenarios)('$name', ({ expectedStatus, presence }) => {
  it(`classifica como ${expectedStatus}`, () => {
    expect(() => assessPageCapabilities(presence)).not.toThrow();
    expect(assessPageCapabilities(presence)).toEqual({
      status: expectedStatus,
      ...presence,
    });
  });
});

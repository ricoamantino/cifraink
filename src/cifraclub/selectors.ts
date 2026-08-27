/**
 * Seletores limitados a tags semânticas, relações estruturais e atributos observados.
 * Classes do Cifra Club são geradas e não fazem parte deste contrato.
 */
export const cifraClubSelectors = {
  printRoot: '[data-print-scroll="true"]',
  page: 'section[data-size]',
  header: ':scope > header',
  title: ':scope h1',
  artist: ':scope h2',
  composerCandidate: ':scope > small',
  chordConfig: '[data-chord-config="true"][data-chord-select="true"]',
  toneValue: 'button[data-anchor="--chord-tone"]',
  tuningValue: 'button[data-anchor="--chord-tuning"]',
  content: ':scope > pre',
  chord: 'b[data-chord-name][data-chord-original-text]',
  chordDiagram: '[data-chord-mode][data-mount]',
  chordDiagramName: ':scope strong',
  chordDiagramItem: 'li',
  // O agrupador dos controles é o filho estrutural do aside irmão da área de impressão.
  nativeControls: ':scope > aside > div',
  // A marca é vazia e estilizada por sprite; não possui nome acessível ou atributo estável.
  brand: ':scope > span > i',
} as const;

/**
 * O compositor não possui atributo semântico próprio na página observada.
 * O adaptador deve filtrar os candidatos pelo prefixo conhecido em português.
 */
export const cifraClubText = {
  composerPrefix: 'Composição de:',
} as const;

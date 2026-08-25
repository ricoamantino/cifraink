import type { PageCapabilities, PageCompatibility } from '../../src/cifraclub/capabilities';

const compatibilityMessages = {
  compatible: 'CifraInk pronto para editar esta cifra.',
  partial: 'CifraInk disponível com alguns recursos limitados.',
  incompatible: 'Esta página não é compatível com o CifraInk.',
} as const satisfies Record<PageCompatibility, string>;

interface PanelProps {
  readonly capabilities: PageCapabilities;
}

export function Panel({ capabilities }: PanelProps) {
  return (
    <section aria-label="CifraInk" data-compatibility={capabilities.status}>
      <p role="status">{compatibilityMessages[capabilities.status]}</p>
    </section>
  );
}

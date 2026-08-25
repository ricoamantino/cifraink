import type { PageCompatibility } from '../cifraclub/capabilities';

const compatibilityMessages = {
  compatible: 'CifraInk pronto para editar esta cifra.',
  partial: 'CifraInk disponível com alguns recursos limitados.',
  incompatible: 'Esta página não é compatível com o CifraInk.',
} as const satisfies Record<PageCompatibility, string>;

interface StatusProps {
  readonly status: PageCompatibility;
}

export function Status({ status }: StatusProps) {
  return (
    <p className="cifraink-status" role="status">
      {compatibilityMessages[status]}
    </p>
  );
}

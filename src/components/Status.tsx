import type { PageCompatibility } from '../cifraclub/capabilities';

export const compatibilityMessages = {
  compatible: 'CifraInk pronto para editar esta cifra.',
  partial: 'CifraInk disponível com alguns recursos limitados.',
  incompatible: 'Esta página não é compatível com o CifraInk.',
} as const satisfies Record<PageCompatibility, string>;

interface StatusProps {
  readonly status: PageCompatibility;
}

export function Status({ status }: StatusProps) {
  return (
    <span className="cifraink-status" data-status={status} role="status">
      <span aria-hidden="true" className="cifraink-status__indicator" />
      <span className="cifraink-visually-hidden">{compatibilityMessages[status]}</span>
    </span>
  );
}

export function StatusNotice({ status }: StatusProps) {
  if (status === 'compatible') {
    return null;
  }

  return (
    <p aria-hidden="true" className="cifraink-status-notice" data-status={status}>
      {compatibilityMessages[status]}
    </p>
  );
}

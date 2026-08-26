import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import type { ReactNode } from 'react';

interface ControlRowProps {
  readonly icon: IconSvgElement;
  readonly label: string;
  readonly value?: string;
  readonly popoverTarget?: string;
  readonly disabled?: boolean;
  readonly children?: ReactNode;
}

export function ControlRow({
  icon,
  label,
  value,
  popoverTarget,
  disabled = false,
  children,
}: ControlRowProps) {
  return (
    <div className="cifraink-control-item">
      <button
        aria-haspopup={popoverTarget ? 'dialog' : undefined}
        className="cifraink-control-row"
        disabled={disabled}
        popoverTarget={popoverTarget}
        type="button"
      >
        <HugeiconsIcon
          aria-hidden="true"
          className="cifraink-control-row__icon"
          icon={icon}
          size={24}
          strokeWidth={2}
        />
        <span className="cifraink-control-row__label">{label}</span>
        {value ? <span className="cifraink-control-row__value">{value}</span> : null}
      </button>
      {children}
    </div>
  );
}

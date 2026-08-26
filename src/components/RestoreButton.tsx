import { RefreshCwIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface RestoreButtonProps {
  readonly onRestore: () => void;
  readonly disabled?: boolean;
}

export function RestoreButton({ onRestore, disabled = false }: RestoreButtonProps) {
  return (
    <button
      className="cifraink-restore-button"
      disabled={disabled}
      onClick={onRestore}
      type="button"
    >
      <HugeiconsIcon
        aria-hidden="true"
        className="cifraink-restore-button__icon"
        icon={RefreshCwIcon}
        size={18}
        strokeWidth={2}
      />
      Restaurar página
    </button>
  );
}

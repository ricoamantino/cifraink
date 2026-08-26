import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { useId } from 'react';

interface FieldToggleProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (visible: boolean) => void;
  readonly disabled?: boolean;
  readonly description?: string;
  readonly icon?: IconSvgElement;
}

export function FieldToggle({
  label,
  checked,
  onChange,
  disabled = false,
  description,
  icon,
}: FieldToggleProps) {
  const inputId = useId();
  const descriptionId = useId();

  return (
    <div className="cifraink-control-item">
      <label className="cifraink-field-toggle" htmlFor={inputId}>
        {icon ? (
          <HugeiconsIcon
            aria-hidden="true"
            className="cifraink-field-toggle__icon"
            icon={icon}
            size={19}
            strokeWidth={3}
          />
        ) : null}
        <span className="cifraink-field-toggle__label">{label}</span>
        <input
          aria-checked={checked}
          aria-describedby={description ? descriptionId : undefined}
          checked={checked}
          className="cifraink-field-toggle__input"
          disabled={disabled}
          id={inputId}
          onChange={(event) => onChange(event.currentTarget.checked)}
          role="switch"
          type="checkbox"
        />
      </label>
      {description ? (
        <span className="cifraink-visually-hidden" id={descriptionId}>
          {description}
        </span>
      ) : null}
    </div>
  );
}

import { useId } from 'react';

interface FieldToggleProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: (visible: boolean) => void;
  readonly disabled?: boolean;
  readonly description?: string;
}

export function FieldToggle({
  label,
  checked,
  onChange,
  disabled = false,
  description,
}: FieldToggleProps) {
  const inputId = useId();
  const descriptionId = useId();

  return (
    <div className="cifraink-field-toggle">
      <label className="cifraink-field-toggle__label" htmlFor={inputId}>
        {label}
      </label>
      {description ? (
        <p className="cifraink-field-toggle__description" id={descriptionId}>
          {description}
        </p>
      ) : null}
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
    </div>
  );
}

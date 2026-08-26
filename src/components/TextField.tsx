import { useId } from 'react';

interface TextFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
}

export function TextField({ label, value, onChange, disabled = false }: TextFieldProps) {
  const inputId = useId();

  return (
    <div className="cifraink-text-field">
      <label className="cifraink-text-field__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        className="cifraink-text-field__input"
        disabled={disabled}
        id={inputId}
        onChange={(event) => onChange(event.currentTarget.value)}
        type="text"
        value={value}
      />
    </div>
  );
}

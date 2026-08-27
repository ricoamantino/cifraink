import { useEffect, useRef, useState } from 'react';
import type { DiagramControlAction, DiagramItemControlState } from '../../src/cifraclub/diagrams';

interface DiagramItemRowProps {
  readonly item: DiagramItemControlState;
  readonly onAction: (action: DiagramControlAction) => void;
}

export function DiagramItemRow({ item, onAction }: DiagramItemRowProps) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus({ preventScroll: true });
      inputRef.current?.select();
    }
  }, [editing]);

  return (
    <div className="cifraink-diagram-item">
      {editing ? (
        <input
          aria-label={`Nome do diagrama ${item.index + 1}`}
          className="cifraink-diagram-item__name-input"
          onBlur={() => setEditing(false)}
          onChange={(event) =>
            onAction({
              type: 'set-diagram-name',
              index: item.index,
              value: event.currentTarget.value,
            })
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              event.currentTarget.blur();
            } else if (event.key === 'Escape') {
              setEditing(false);
            }
          }}
          ref={inputRef}
          type="text"
          value={item.name ?? ''}
        />
      ) : (
        <button
          aria-label={`Editar nome de ${item.label}`}
          className="cifraink-diagram-item__name"
          onClick={() => setEditing(true)}
          title="Editar nome"
          type="button"
        >
          {item.label}
        </button>
      )}

      <span className="cifraink-diagram-item__actions">
        {item.visible && item.markingsAvailable ? (
          <DiagramSwitch
            checked={item.markingsVisible}
            label={`Mostrar posições de ${item.label}`}
            onChange={(visible) =>
              onAction({
                type: 'set-diagram-markings-visible',
                index: item.index,
                visible,
              })
            }
            title="Mostrar posições"
            variant="markings"
          />
        ) : null}
        <DiagramSwitch
          checked={item.visible}
          label={`Mostrar diagrama ${item.label}`}
          onChange={(visible) =>
            onAction({ type: 'set-diagram-visible', index: item.index, visible })
          }
          title="Mostrar diagrama"
          variant="diagram"
        />
      </span>
    </div>
  );
}

interface DiagramSwitchProps {
  readonly checked: boolean;
  readonly label: string;
  readonly onChange: (checked: boolean) => void;
  readonly title: string;
  readonly variant: 'diagram' | 'markings';
}

function DiagramSwitch({ checked, label, onChange, title, variant }: DiagramSwitchProps) {
  return (
    <input
      aria-checked={checked}
      aria-label={label}
      checked={checked}
      className={`cifraink-diagram-switch cifraink-diagram-switch--${variant}`}
      onChange={(event) => onChange(event.currentTarget.checked)}
      role="switch"
      title={title}
      type="checkbox"
    />
  );
}

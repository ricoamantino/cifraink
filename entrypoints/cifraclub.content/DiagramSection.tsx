import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { DiagramControlAction, DiagramControlState } from '../../src/cifraclub/diagrams';
import { FieldToggle } from '../../src/components/FieldToggle';
import { Section } from '../../src/components/Section';

interface DiagramSectionProps {
  readonly state: DiagramControlState;
  readonly onAction: (action: DiagramControlAction) => void;
}

export function DiagramSection({ state, onAction }: DiagramSectionProps) {
  if (!state.available) {
    return null;
  }

  return (
    <Section title="Diagramas">
      <details className="cifraink-diagram-list">
        <summary className="cifraink-diagram-list__summary">
          <span>Diagramas individuais ({state.items.length})</span>
          <span aria-hidden="true" className="cifraink-diagram-list__toggle">
            <HugeiconsIcon
              className="cifraink-diagram-list__toggle-icon"
              icon={ArrowDown01Icon}
              size={18}
              strokeWidth={2}
            />
          </span>
        </summary>
        <div className="cifraink-diagram-list__items">
          {state.items.map((item) => (
            <FieldToggle
              checked={item.visible}
              key={item.index}
              label={item.label}
              onChange={(visible) =>
                onAction({ type: 'set-diagram-visible', index: item.index, visible })
              }
            />
          ))}
        </div>
      </details>
    </Section>
  );
}

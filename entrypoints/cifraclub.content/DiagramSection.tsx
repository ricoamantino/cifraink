import { Grid3X3Icon as Grid3x3Icon } from '@hugeicons/core-free-icons';
import { useId } from 'react';
import type { DiagramControlAction, DiagramControlState } from '../../src/cifraclub/diagrams';
import { ControlRow } from '../../src/components/ControlRow';
import { SidePopover } from '../../src/components/SidePopover';
import { DiagramItemRow } from './DiagramItemRow';

interface DiagramSectionProps {
  readonly state: DiagramControlState;
  readonly onAction: (action: DiagramControlAction) => void;
}

export function DiagramSection({ state, onAction }: DiagramSectionProps) {
  const popoverId = `cifraink-diagrams-${useId().replaceAll(':', '')}`;

  if (!state.available) {
    return null;
  }

  const visibleCount = state.items.filter((item) => item.visible).length;

  return (
    <ControlRow
      icon={Grid3x3Icon}
      label="Diagramas individuais"
      popoverTarget={popoverId}
      value={`${visibleCount} de ${state.items.length}`}
    >
      <SidePopover id={popoverId} label="Diagramas individuais" scrollable>
        <div className="cifraink-diagram-options">
          {state.items.map((item) => (
            <DiagramItemRow item={item} key={item.index} onAction={onAction} />
          ))}
        </div>
      </SidePopover>
    </ControlRow>
  );
}

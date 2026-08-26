import type { IconSvgElement } from '@hugeicons/react';
import { useId } from 'react';
import { ControlRow } from '../../src/components/ControlRow';
import { FieldToggle } from '../../src/components/FieldToggle';
import { SidePopover } from '../../src/components/SidePopover';
import { TextField } from '../../src/components/TextField';

interface HeaderTextControlProps {
  readonly icon: IconSvgElement;
  readonly label: string;
  readonly value: string;
  readonly visible: boolean;
  readonly onTextChange: (value: string) => void;
  readonly onVisibilityChange: (visible: boolean) => void;
}

export function HeaderTextControl({
  icon,
  label,
  value,
  visible,
  onTextChange,
  onVisibilityChange,
}: HeaderTextControlProps) {
  const popoverId = `cifraink-editor-${useId().replaceAll(':', '')}`;

  return (
    <ControlRow icon={icon} label={label} popoverTarget={popoverId} value={value || 'Sem texto'}>
      <SidePopover id={popoverId} label={`Editar ${label.toLocaleLowerCase('pt-BR')}`}>
        <TextField focusOnPopoverOpen label={label} onChange={onTextChange} value={value} />
        <FieldToggle
          checked={visible}
          label={`Mostrar ${label.toLocaleLowerCase('pt-BR')}`}
          onChange={onVisibilityChange}
        />
      </SidePopover>
    </ControlRow>
  );
}

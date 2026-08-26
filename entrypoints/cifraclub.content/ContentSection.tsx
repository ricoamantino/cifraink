import { FilePenIcon } from '@hugeicons/core-free-icons';
import type { ContentControlAction, ContentControlState } from '../../src/cifraclub/content';
import { FieldToggle } from '../../src/components/FieldToggle';

interface ContentSectionProps {
  readonly state: ContentControlState;
  readonly onAction: (action: ContentControlAction) => void;
}

export function ContentSection({ state, onAction }: ContentSectionProps) {
  if (!state.available) {
    return null;
  }

  return (
    <FieldToggle
      checked={state.editable}
      description="Permite alterar letra e acordes diretamente na cifra."
      icon={FilePenIcon}
      label="Editar conteúdo"
      onChange={(editable) => onAction({ type: 'set-editable', editable })}
    />
  );
}

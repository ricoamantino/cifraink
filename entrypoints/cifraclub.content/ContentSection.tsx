import type { ContentControlAction, ContentControlState } from '../../src/cifraclub/content';
import { FieldToggle } from '../../src/components/FieldToggle';
import { Section } from '../../src/components/Section';

interface ContentSectionProps {
  readonly state: ContentControlState;
  readonly onAction: (action: ContentControlAction) => void;
}

export function ContentSection({ state, onAction }: ContentSectionProps) {
  if (!state.available) {
    return null;
  }

  return (
    <Section title="Conteúdo">
      <FieldToggle
        checked={state.editable}
        description="Permite alterar letra e acordes diretamente na cifra."
        label="Editar conteúdo"
        onChange={(editable) => onAction({ type: 'set-editable', editable })}
      />
    </Section>
  );
}

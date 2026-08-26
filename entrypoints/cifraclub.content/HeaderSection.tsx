import {
  type HeaderControlAction,
  type HeaderControlState,
  hasHeaderControls,
} from '../../src/cifraclub/header';
import { FieldToggle } from '../../src/components/FieldToggle';
import { Section } from '../../src/components/Section';
import { TextField } from '../../src/components/TextField';

interface HeaderSectionProps {
  readonly state: HeaderControlState;
  readonly onAction: (action: HeaderControlAction) => void;
}

export function HeaderSection({ state, onAction }: HeaderSectionProps) {
  if (!hasHeaderControls(state)) {
    return null;
  }

  return (
    <Section title="Cabeçalho">
      {state.title ? (
        <>
          <TextField
            label="Título"
            onChange={(value) => onAction({ type: 'set-text', field: 'title', value })}
            value={state.title.value}
          />
          <FieldToggle
            checked={state.title.visible}
            label="Mostrar título"
            onChange={(visible) => onAction({ type: 'set-visibility', target: 'title', visible })}
          />
        </>
      ) : null}

      {state.artist ? (
        <>
          <TextField
            label="Artista"
            onChange={(value) => onAction({ type: 'set-text', field: 'artist', value })}
            value={state.artist.value}
          />
          <FieldToggle
            checked={state.artist.visible}
            label="Mostrar artista"
            onChange={(visible) => onAction({ type: 'set-visibility', target: 'artist', visible })}
          />
        </>
      ) : null}

      {state.composer ? (
        <>
          <TextField
            label="Compositor"
            onChange={(value) => onAction({ type: 'set-text', field: 'composer', value })}
            value={state.composer.value}
          />
          <FieldToggle
            checked={state.composer.visible}
            label="Mostrar compositor"
            onChange={(visible) =>
              onAction({ type: 'set-visibility', target: 'composer', visible })
            }
          />
        </>
      ) : null}

      {state.brand ? (
        <FieldToggle
          checked={state.brand.visible}
          label="Mostrar marca"
          onChange={(visible) => onAction({ type: 'set-visibility', target: 'brand', visible })}
        />
      ) : null}

      {state.compactAvailable ? (
        <FieldToggle
          checked={state.compact}
          label="Cabeçalho compacto"
          onChange={(compact) => onAction({ type: 'set-compact', compact })}
        />
      ) : null}
    </Section>
  );
}

import {
  Image02Icon,
  LayoutAlignTopIcon,
  MusicNote01Icon,
  Pen01Icon,
  StarIcon,
} from '@hugeicons/core-free-icons';
import {
  type HeaderControlAction,
  type HeaderControlState,
  hasHeaderControls,
} from '../../src/cifraclub/header';
import { ControlGroup } from '../../src/components/ControlGroup';
import { FieldToggle } from '../../src/components/FieldToggle';
import { HeaderTextControl } from './HeaderTextControl';

interface HeaderSectionProps {
  readonly state: HeaderControlState;
  readonly onAction: (action: HeaderControlAction) => void;
}

export function HeaderSection({ state, onAction }: HeaderSectionProps) {
  if (!hasHeaderControls(state)) {
    return null;
  }

  return (
    <ControlGroup title="Cabeçalho">
      {state.title ? (
        <HeaderTextControl
          icon={MusicNote01Icon}
          label="Título"
          onTextChange={(value) => onAction({ type: 'set-text', field: 'title', value })}
          onVisibilityChange={(visible) =>
            onAction({ type: 'set-visibility', target: 'title', visible })
          }
          value={state.title.value}
          visible={state.title.visible}
        />
      ) : null}

      {state.artist ? (
        <HeaderTextControl
          icon={StarIcon}
          label="Artista"
          onTextChange={(value) => onAction({ type: 'set-text', field: 'artist', value })}
          onVisibilityChange={(visible) =>
            onAction({ type: 'set-visibility', target: 'artist', visible })
          }
          value={state.artist.value}
          visible={state.artist.visible}
        />
      ) : null}

      {state.composer ? (
        <HeaderTextControl
          icon={Pen01Icon}
          label="Compositor"
          onTextChange={(value) => onAction({ type: 'set-text', field: 'composer', value })}
          onVisibilityChange={(visible) =>
            onAction({ type: 'set-visibility', target: 'composer', visible })
          }
          value={state.composer.value}
          visible={state.composer.visible}
        />
      ) : null}

      {state.brand ? (
        <FieldToggle
          checked={state.brand.visible}
          icon={Image02Icon}
          label="Mostrar marca"
          onChange={(visible) => onAction({ type: 'set-visibility', target: 'brand', visible })}
        />
      ) : null}

      {state.compactAvailable ? (
        <FieldToggle
          checked={state.compact}
          icon={LayoutAlignTopIcon}
          label="Cabeçalho compacto"
          onChange={(compact) => onAction({ type: 'set-compact', compact })}
        />
      ) : null}
    </ControlGroup>
  );
}

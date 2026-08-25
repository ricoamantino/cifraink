import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { browser } from 'wxt/browser';
import type { PageCapabilities } from '../../src/cifraclub/capabilities';
import { RestoreButton } from '../../src/components/RestoreButton';
import { Status } from '../../src/components/Status';

interface PanelProps {
  readonly capabilities: PageCapabilities;
  readonly onRestore: () => void;
}

const panelContentId = 'cifraink-panel-content';
const panelActionsId = 'cifraink-panel-actions';
const iconUrl = browser.runtime.getURL('/icon/cifraink.svg');

export function Panel({ capabilities, onRestore }: PanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const toggleLabel = collapsed ? 'Abrir painel' : 'Recolher painel';

  return (
    <section
      aria-label="CifraInk"
      className="cifraink-ui"
      data-collapsed={collapsed}
      data-compatibility={capabilities.status}
    >
      <div className="cifraink-panel">
        <header className="cifraink-panel__header">
          <span className="cifraink-panel__brand">
            <img alt="" className="cifraink-panel__logo" height="32" src={iconUrl} width="32" />
            <strong className="cifraink-panel__name">CifraInk</strong>
          </span>
          <button
            aria-controls={`${panelContentId} ${panelActionsId}`}
            aria-expanded={!collapsed}
            aria-label={toggleLabel}
            className="cifraink-panel__toggle"
            onClick={() => setCollapsed((current) => !current)}
            type="button"
          >
            <HugeiconsIcon
              aria-hidden="true"
              className="cifraink-panel__toggle-icon"
              icon={collapsed ? ArrowDown01Icon : ArrowUp01Icon}
              size={18}
              strokeWidth={2}
            />
          </button>
        </header>

        <div className="cifraink-panel__content" hidden={collapsed} id={panelContentId}>
          <Status status={capabilities.status} />
        </div>
      </div>

      <div className="cifraink-panel__actions" hidden={collapsed} id={panelActionsId}>
        <RestoreButton onRestore={onRestore} />
      </div>
    </section>
  );
}

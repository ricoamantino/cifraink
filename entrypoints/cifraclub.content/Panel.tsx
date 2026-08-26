import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { browser } from 'wxt/browser';
import type { PageCapabilities } from '../../src/cifraclub/capabilities';
import type { ContentControlAction, ContentControlState } from '../../src/cifraclub/content';
import type { DiagramControlAction, DiagramControlState } from '../../src/cifraclub/diagrams';
import type { HeaderControlAction, HeaderControlState } from '../../src/cifraclub/header';
import { RestoreButton } from '../../src/components/RestoreButton';
import { Status } from '../../src/components/Status';
import { ContentSection } from './ContentSection';
import { DiagramSection } from './DiagramSection';
import { HeaderSection } from './HeaderSection';

interface PanelProps {
  readonly capabilities: PageCapabilities;
  readonly initialContent: ContentControlState;
  readonly initialDiagrams: DiagramControlState;
  readonly initialHeader: HeaderControlState;
  readonly onContentAction: (action: ContentControlAction) => ContentControlState;
  readonly onDiagramAction: (action: DiagramControlAction) => DiagramControlState;
  readonly onHeaderAction: (
    current: HeaderControlState,
    action: HeaderControlAction,
  ) => HeaderControlState;
  readonly onRestore: () => void;
}

const panelContentId = 'cifraink-panel-content';
const panelActionsId = 'cifraink-panel-actions';
const iconUrl = browser.runtime.getURL('/icon/cifraink.svg');

export function Panel({
  capabilities,
  initialContent,
  initialDiagrams,
  initialHeader,
  onContentAction,
  onDiagramAction,
  onHeaderAction,
  onRestore,
}: PanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [diagrams, setDiagrams] = useState(initialDiagrams);
  const [header, setHeader] = useState(initialHeader);
  const toggleLabel = collapsed ? 'Abrir painel' : 'Recolher painel';

  function handleHeaderAction(action: HeaderControlAction): void {
    setHeader((current) => onHeaderAction(current, action));
  }

  function handleRestore(): void {
    onRestore();
    setContent(initialContent);
    setDiagrams(initialDiagrams);
    setHeader(initialHeader);
  }

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
          <HeaderSection onAction={handleHeaderAction} state={header} />
          <ContentSection
            onAction={(action) => setContent(onContentAction(action))}
            state={content}
          />
          <DiagramSection
            onAction={(action) => setDiagrams(onDiagramAction(action))}
            state={diagrams}
          />
        </div>
      </div>

      <div className="cifraink-panel__actions" hidden={collapsed} id={panelActionsId}>
        <RestoreButton onRestore={handleRestore} />
      </div>
    </section>
  );
}

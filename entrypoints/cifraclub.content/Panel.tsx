import { ArrowDown01Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useRef, useState } from 'react';
import { browser } from 'wxt/browser';
import type { PageCapabilities } from '../../src/cifraclub/capabilities';
import type { ContentControlAction, ContentControlState } from '../../src/cifraclub/content';
import type { DiagramControlAction, DiagramControlState } from '../../src/cifraclub/diagrams';
import type { HeaderControlAction, HeaderControlState } from '../../src/cifraclub/header';
import { RestoreButton } from '../../src/components/RestoreButton';
import { Status, StatusNotice } from '../../src/components/Status';
import { DocumentSection } from './DocumentSection';
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
  const panelRef = useRef<HTMLElement>(null);
  const toggleLabel = collapsed ? 'Abrir painel' : 'Recolher painel';

  function handleHeaderAction(action: HeaderControlAction): void {
    setHeader((current) => onHeaderAction(current, action));
  }

  function handleRestore(): void {
    closePanelPopovers(panelRef.current);
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
      ref={panelRef}
    >
      <div className="cifraink-panel">
        <header className="cifraink-panel__header">
          <span className="cifraink-panel__brand">
            <img alt="" className="cifraink-panel__logo" height="32" src={iconUrl} width="32" />
            <strong className="cifraink-panel__name">CifraInk</strong>
            <Status status={capabilities.status} />
          </span>
          <button
            aria-controls={`${panelContentId} ${panelActionsId}`}
            aria-expanded={!collapsed}
            aria-label={toggleLabel}
            className="cifraink-panel__toggle"
            onClick={() => {
              if (!collapsed) {
                closePanelPopovers(panelRef.current);
              }

              setCollapsed((current) => !current);
            }}
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
        <StatusNotice status={capabilities.status} />
      </div>

      <div className="cifraink-panel__content" hidden={collapsed} id={panelContentId}>
        <HeaderSection onAction={handleHeaderAction} state={header} />
        <DocumentSection
          content={content}
          diagrams={diagrams}
          onContentAction={(action) => setContent(onContentAction(action))}
          onDiagramAction={(action) => setDiagrams(onDiagramAction(action))}
        />
      </div>

      <div className="cifraink-panel__actions" hidden={collapsed} id={panelActionsId}>
        <RestoreButton onRestore={handleRestore} />
      </div>
    </section>
  );
}

function closePanelPopovers(panel: HTMLElement | null): void {
  for (const popover of panel?.querySelectorAll<HTMLElement>('[popover]') ?? []) {
    if (typeof popover.hidePopover === 'function' && popover.matches(':popover-open')) {
      popover.hidePopover();
    }
  }
}

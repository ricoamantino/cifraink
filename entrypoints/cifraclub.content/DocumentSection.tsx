import type { ContentControlAction, ContentControlState } from '../../src/cifraclub/content';
import type { DiagramControlAction, DiagramControlState } from '../../src/cifraclub/diagrams';
import { ControlGroup } from '../../src/components/ControlGroup';
import { ContentSection } from './ContentSection';
import { DiagramSection } from './DiagramSection';

interface DocumentSectionProps {
  readonly content: ContentControlState;
  readonly diagrams: DiagramControlState;
  readonly onContentAction: (action: ContentControlAction) => void;
  readonly onDiagramAction: (action: DiagramControlAction) => void;
}

export function DocumentSection({
  content,
  diagrams,
  onContentAction,
  onDiagramAction,
}: DocumentSectionProps) {
  if (!content.available && !diagrams.available) {
    return null;
  }

  return (
    <ControlGroup title="Documento">
      <ContentSection onAction={onContentAction} state={content} />
      <DiagramSection onAction={onDiagramAction} state={diagrams} />
    </ControlGroup>
  );
}

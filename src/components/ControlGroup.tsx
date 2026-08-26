import { type ReactNode, useId } from 'react';

interface ControlGroupProps {
  readonly title: string;
  readonly children: ReactNode;
}

export function ControlGroup({ title, children }: ControlGroupProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="cifraink-control-group">
      <h2 className="cifraink-visually-hidden" id={titleId}>
        {title}
      </h2>
      {children}
    </section>
  );
}

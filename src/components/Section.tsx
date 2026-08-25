import { type ReactNode, useId } from 'react';

interface SectionProps {
  readonly title: string;
  readonly children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="cifraink-section">
      <h2 className="cifraink-section__title" id={titleId}>
        {title}
      </h2>
      {children}
    </section>
  );
}

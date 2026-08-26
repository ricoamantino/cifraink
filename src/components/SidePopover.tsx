import type { ReactNode } from 'react';

interface SidePopoverProps {
  readonly id: string;
  readonly label: string;
  readonly children: ReactNode;
  readonly scrollable?: boolean;
}

export function SidePopover({ id, label, children, scrollable = false }: SidePopoverProps) {
  return (
    <div
      aria-label={label}
      className="cifraink-side-popover"
      data-scrollable={scrollable}
      data-variant={scrollable ? 'selection' : 'editor'}
      id={id}
      onToggle={(event) => {
        const toggleEvent = event.nativeEvent as ToggleEvent;

        if (toggleEvent.newState === 'open') {
          if (scrollable) {
            const scrollContainer = event.currentTarget.querySelector<HTMLElement>(
              '.cifraink-diagram-options',
            );
            if (scrollContainer) {
              scrollContainer.scrollTop = 0;
            }
          }

          const focusTarget =
            event.currentTarget.querySelector<HTMLElement>('[data-cifraink-popover-focus]') ??
            (scrollable ? event.currentTarget.querySelector<HTMLElement>('input') : null);
          focusTarget?.focus({ preventScroll: true });
        }
      }}
      popover="auto"
      role="dialog"
    >
      {children}
    </div>
  );
}

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
      id={id}
      onToggle={(event) => {
        const toggleEvent = event.nativeEvent as ToggleEvent;

        if (toggleEvent.newState === 'open') {
          event.currentTarget.querySelector<HTMLElement>('[data-cifraink-popover-focus]')?.focus();
        }
      }}
      popover="auto"
      role="dialog"
    >
      {children}
    </div>
  );
}

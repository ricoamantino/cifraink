import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Panel } from '../../entrypoints/cifraclub.content/Panel';
import type { PageCapabilities, PageCompatibility } from '../../src/cifraclub/capabilities';
import type { ContentControlAction, ContentControlState } from '../../src/cifraclub/content';
import type { DiagramControlAction, DiagramControlState } from '../../src/cifraclub/diagrams';
import type { HeaderControlAction, HeaderControlState } from '../../src/cifraclub/header';

const compatibilityMessages = {
  compatible: 'CifraInk pronto para editar esta cifra.',
  partial: 'CifraInk disponível com alguns recursos limitados.',
  incompatible: 'Esta página não é compatível com o CifraInk.',
} as const satisfies Record<PageCompatibility, string>;

const completeHeader = {
  title: { value: 'Título original', visible: true },
  artist: { value: 'Artista original', visible: true },
  composer: { value: 'Pessoa autora', visible: true },
  brand: { visible: true },
  compact: false,
  compactAvailable: true,
} satisfies HeaderControlState;

const emptyHeader = {
  title: null,
  artist: null,
  composer: null,
  brand: null,
  compact: false,
  compactAvailable: false,
} satisfies HeaderControlState;

const availableContent = {
  available: true,
  editable: false,
} satisfies ContentControlState;

const unavailableContent = {
  available: false,
  editable: false,
} satisfies ContentControlState;

const availableDiagrams = {
  available: true,
  items: [
    { index: 0, label: 'A', visible: true },
    { index: 1, label: 'Bm7', visible: true },
  ],
} satisfies DiagramControlState;

const unavailableDiagrams = {
  available: false,
  items: [],
} satisfies DiagramControlState;

function createCapabilities(status: PageCompatibility): PageCapabilities {
  const available = status === 'compatible';

  return {
    status,
    printRoot: status !== 'incompatible',
    title: available,
    artist: available,
    composer: available,
    content: status !== 'incompatible',
    chordDiagrams: available,
    brand: available,
  };
}

function updateHeaderState(
  current: HeaderControlState,
  action: HeaderControlAction,
): HeaderControlState {
  if (action.type === 'set-compact') {
    return { ...current, compact: action.compact };
  }

  if (action.type === 'set-text') {
    const control = current[action.field];
    return control ? { ...current, [action.field]: { ...control, value: action.value } } : current;
  }

  const control = current[action.target];
  return control
    ? { ...current, [action.target]: { ...control, visible: action.visible } }
    : current;
}

function updateDiagramState(
  current: DiagramControlState,
  action: DiagramControlAction,
): DiagramControlState {
  return {
    ...current,
    items: current.items.map((item) =>
      item.index === action.index ? { ...item, visible: action.visible } : item,
    ),
  };
}

function panel(
  status: PageCompatibility = 'compatible',
  initialHeader: HeaderControlState = completeHeader,
  onRestore: () => void = () => {},
  onHeaderAction: (
    current: HeaderControlState,
    action: HeaderControlAction,
  ) => HeaderControlState = updateHeaderState,
  initialContent: ContentControlState = availableContent,
  onContentAction: (action: ContentControlAction) => ContentControlState = (action) => ({
    available: true,
    editable: action.editable,
  }),
  initialDiagrams: DiagramControlState = availableDiagrams,
  onDiagramAction: (action: DiagramControlAction) => DiagramControlState = (action) =>
    updateDiagramState(availableDiagrams, action),
): ReactElement {
  return (
    <Panel
      capabilities={createCapabilities(status)}
      initialContent={initialContent}
      initialDiagrams={initialDiagrams}
      initialHeader={initialHeader}
      onContentAction={onContentAction}
      onDiagramAction={onDiagramAction}
      onHeaderAction={onHeaderAction}
      onRestore={onRestore}
    />
  );
}

describe('painel do CifraInk', () => {
  it('inicia aberto com marca e controles acessíveis', () => {
    render(panel());

    const panelRegion = screen.getByRole('region', { name: 'CifraInk' });
    const toggle = screen.getByRole('button', { name: 'Recolher painel' });

    expect(panelRegion).toHaveAttribute('data-collapsed', 'false');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute(
      'aria-controls',
      'cifraink-panel-content cifraink-panel-actions',
    );
    expect(toggle.closest('.cifraink-panel__header')).not.toBeNull();
    expect(toggle).toContainElement(screen.getByText('CifraInk'));
    expect(toggle.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByText('CifraInk')).toBeVisible();
    expect(screen.getByRole('presentation')).toHaveAttribute('alt', '');
    expect(screen.getByRole('presentation')).toHaveAttribute(
      'src',
      'chrome-extension://test-extension-id/icon/cifraink.svg',
    );
    expect(screen.getByRole('region', { name: 'Cabeçalho' })).toBeVisible();
    expect(screen.getByRole('region', { name: 'Documento' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Cabeçalho' })).toHaveClass(
      'cifraink-visually-hidden',
    );
    expect(screen.getByRole('heading', { name: 'Documento' })).toHaveClass(
      'cifraink-visually-hidden',
    );

    const restoreButton = screen.getByRole('button', { name: 'Restaurar página' });
    expect(restoreButton).toBeEnabled();
    expect(restoreButton.closest('.cifraink-panel')).toBeNull();
  });

  it('recolhe e reabre mantendo a marca e o estado funcional', () => {
    render(panel());

    const collapseButton = screen.getByRole('button', { name: 'Recolher painel' });
    const collapseIcon = collapseButton.querySelector('path')?.getAttribute('d');
    fireEvent.click(collapseButton);

    const collapsedPanel = screen.getByRole('region', { name: 'CifraInk' });
    const openButton = screen.getByRole('button', { name: 'Abrir painel' });
    expect(collapsedPanel).toHaveAttribute('data-collapsed', 'true');
    expect(openButton).toHaveAttribute('aria-expanded', 'false');
    expect(openButton.querySelector('path')).not.toHaveAttribute('d', collapseIcon);
    expect(screen.getByText('CifraInk')).toBeVisible();
    expect(screen.getByRole('status')).toBeVisible();
    expect(screen.getByRole('textbox', { name: 'Título', hidden: true })).toHaveValue(
      'Título original',
    );

    openButton.focus();
    fireEvent.click(openButton);

    expect(screen.getByRole('button', { name: 'Recolher painel' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'TítuloTítulo original' })).toBeVisible();
    expect(screen.getByRole('textbox', { hidden: true, name: 'Título' })).toHaveValue(
      'Título original',
    );
  });

  it('fecha popovers abertos ao recolher e ao restaurar', () => {
    render(panel());

    const titleTrigger = screen.getByRole('button', { name: 'TítuloTítulo original' });
    const popoverId = titleTrigger.getAttribute('popovertarget');
    const popover = popoverId ? document.getElementById(popoverId) : null;
    const hidePopover = vi.fn();

    expect(popover).not.toBeNull();
    expect(popover?.querySelector('hr')).toHaveClass('cifraink-side-popover__divider');
    Object.defineProperty(popover, 'hidePopover', { configurable: true, value: hidePopover });
    vi.spyOn(popover as HTMLElement, 'matches').mockImplementation(
      (selector) => selector === ':popover-open',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Recolher painel' }));
    expect(hidePopover).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir painel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar página' }));
    expect(hidePopover).toHaveBeenCalledTimes(2);
  });

  it('edita valores e visibilidades por ações controladas', () => {
    const onHeaderAction = vi.fn(updateHeaderState);
    render(panel('compatible', completeHeader, () => {}, onHeaderAction));

    fireEvent.change(screen.getByRole('textbox', { hidden: true, name: 'Título' }), {
      target: { value: 'Novo título' },
    });
    fireEvent.click(screen.getByRole('switch', { hidden: true, name: 'Mostrar título' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Cabeçalho compacto' }));

    expect(onHeaderAction).toHaveBeenNthCalledWith(1, completeHeader, {
      type: 'set-text',
      field: 'title',
      value: 'Novo título',
    });
    expect(screen.getByRole('textbox', { hidden: true, name: 'Título' })).toHaveValue(
      'Novo título',
    );
    expect(screen.getByRole('textbox', { hidden: true, name: 'Título' })).toBeEnabled();
    expect(screen.getByRole('switch', { hidden: true, name: 'Mostrar título' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Cabeçalho compacto' })).toBeChecked();
  });

  it('omite somente controles dos recursos ausentes', () => {
    render(panel('partial', { ...completeHeader, composer: null, brand: null }));

    expect(screen.getByRole('button', { name: 'TítuloTítulo original' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'ArtistaArtista original' })).toBeVisible();
    expect(screen.queryByRole('button', { name: /Compositor/ })).toBeNull();
    expect(screen.queryByRole('switch', { name: 'Mostrar marca' })).toBeNull();
    expect(screen.getByRole('switch', { name: 'Cabeçalho compacto' })).toBeVisible();
  });

  it('omite a seção quando nenhum controle do cabeçalho está disponível', () => {
    render(panel('incompatible', emptyHeader));

    expect(screen.queryByRole('region', { name: 'Cabeçalho' })).toBeNull();
  });

  it('controla a edição do conteúdo com explicação acessível', () => {
    const onContentAction = vi.fn((action: ContentControlAction) => ({
      available: true,
      editable: action.editable,
    }));
    render(
      panel(
        'compatible',
        completeHeader,
        () => {},
        updateHeaderState,
        availableContent,
        onContentAction,
      ),
    );

    const toggle = screen.getByRole('switch', { name: 'Editar conteúdo' });
    expect(toggle).not.toBeChecked();
    expect(toggle).toHaveAccessibleDescription(
      'Permite alterar letra e acordes diretamente na cifra.',
    );

    fireEvent.click(toggle);

    expect(onContentAction).toHaveBeenCalledWith({ type: 'set-editable', editable: true });
    expect(toggle).toBeChecked();
  });

  it('omite o controle de conteúdo quando não há blocos musicais', () => {
    render(panel('incompatible', emptyHeader, () => {}, updateHeaderState, unavailableContent));

    expect(screen.queryByRole('switch', { name: 'Editar conteúdo' })).toBeNull();
    expect(screen.getByRole('region', { name: 'Documento' })).toBeVisible();
  });

  it('relaciona a linha ao seletor lateral e controla diagramas por índice', () => {
    const onDiagramAction = vi.fn((action: DiagramControlAction) =>
      updateDiagramState(availableDiagrams, action),
    );
    render(
      panel(
        'compatible',
        completeHeader,
        () => {},
        updateHeaderState,
        availableContent,
        (action) => ({ available: true, editable: action.editable }),
        availableDiagrams,
        onDiagramAction,
      ),
    );

    const trigger = screen.getByRole('button', { name: 'Diagramas individuais2 de 2' });
    const popoverId = trigger.getAttribute('popovertarget');
    const popover = popoverId ? document.getElementById(popoverId) : null;
    expect(popoverId).toBeTruthy();
    expect(popover).toHaveAttribute('id', popoverId);
    expect(popover).toHaveAttribute('popover', 'auto');
    expect(popover).toHaveAttribute('data-scrollable', 'true');
    expect(popover).toHaveAttribute('data-variant', 'selection');

    const firstDiagram = screen.getByRole('switch', { hidden: true, name: 'A' });
    fireEvent.click(firstDiagram);

    expect(onDiagramAction).toHaveBeenCalledWith({
      type: 'set-diagram-visible',
      index: 0,
      visible: false,
    });
    expect(firstDiagram).not.toBeChecked();
    expect(screen.getByRole('switch', { hidden: true, name: 'Bm7' })).toBeChecked();
  });

  it('omite a seção Diagramas quando nenhum diagrama está disponível', () => {
    render(
      panel(
        'partial',
        completeHeader,
        () => {},
        updateHeaderState,
        availableContent,
        (action) => ({ available: true, editable: action.editable }),
        unavailableDiagrams,
      ),
    );

    expect(screen.queryByRole('button', { name: /Diagramas individuais/ })).toBeNull();
  });

  it('deriva a compatibilidade das propriedades sem perder o estado visual local', () => {
    const { rerender } = render(panel());

    fireEvent.click(screen.getByRole('button', { name: 'Recolher painel' }));
    rerender(panel('partial'));

    const panelRegion = screen.getByRole('region', { name: 'CifraInk' });
    expect(panelRegion).toHaveAttribute('data-collapsed', 'true');
    expect(panelRegion).toHaveAttribute('data-compatibility', 'partial');
    expect(screen.getByRole('status', { hidden: true })).toHaveTextContent(
      compatibilityMessages.partial,
    );
  });

  it.each(Object.entries(compatibilityMessages))(
    'exibe o estado %s sem detalhes técnicos',
    (status, message) => {
      render(panel(status as PageCompatibility));

      const panelRegion = screen.getByRole('region', { name: 'CifraInk' });
      const statusElement = screen.getByRole('status');
      expect(panelRegion).toHaveAttribute('data-compatibility', status);
      expect(statusElement).toHaveTextContent(message);
      expect(statusElement.textContent).not.toMatch(/selector|exception|data-print-scroll/i);
      const notice = document.querySelector('.cifraink-status-notice');

      if (status === 'compatible') {
        expect(notice).toBeNull();
      } else {
        expect(notice).toHaveTextContent(message);
      }
    },
  );

  it('restaura os controles ao estado inicial sem alterar abertura do painel', () => {
    const onRestore = vi.fn();
    render(panel('compatible', completeHeader, onRestore));

    fireEvent.change(screen.getByRole('textbox', { hidden: true, name: 'Título' }), {
      target: { value: 'Alterado' },
    });
    fireEvent.click(screen.getByRole('switch', { name: 'Mostrar marca' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Editar conteúdo' }));
    fireEvent.click(screen.getByRole('switch', { hidden: true, name: 'A' }));
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar página' }));

    expect(onRestore).toHaveBeenCalledOnce();
    expect(screen.getByRole('textbox', { hidden: true, name: 'Título' })).toHaveValue(
      'Título original',
    );
    expect(screen.getByRole('switch', { name: 'Mostrar marca' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Editar conteúdo' })).not.toBeChecked();
    expect(screen.getByRole('switch', { hidden: true, name: 'A' })).toBeChecked();
    expect(screen.getByRole('region', { name: 'CifraInk' })).toHaveAttribute(
      'data-collapsed',
      'false',
    );
  });
});

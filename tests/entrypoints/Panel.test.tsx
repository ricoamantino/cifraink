import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Panel } from '../../entrypoints/cifraclub.content/Panel';
import type { PageCapabilities, PageCompatibility } from '../../src/cifraclub/capabilities';

const compatibilityMessages = {
  compatible: 'CifraInk pronto para editar esta cifra.',
  partial: 'CifraInk disponível com alguns recursos limitados.',
  incompatible: 'Esta página não é compatível com o CifraInk.',
} as const satisfies Record<PageCompatibility, string>;

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

describe('painel do CifraInk', () => {
  it('inicia aberto com marca e controles acessíveis', () => {
    render(<Panel capabilities={createCapabilities('compatible')} onRestore={() => {}} />);

    const panel = screen.getByRole('region', { name: 'CifraInk' });
    const toggle = screen.getByRole('button', { name: 'Recolher painel' });
    const status = screen.getByRole('status');

    expect(panel).toHaveAttribute('data-collapsed', 'false');
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAttribute(
      'aria-controls',
      'cifraink-panel-content cifraink-panel-actions',
    );
    expect(toggle.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(status).toBeVisible();
    expect(screen.getByText('CifraInk')).toBeVisible();
    expect(screen.getByRole('presentation')).toHaveAttribute('alt', '');
    expect(screen.getByRole('presentation')).toHaveAttribute(
      'src',
      'chrome-extension://test-extension-id/icon/cifraink.svg',
    );
    const restoreButton = screen.getByRole('button', { name: 'Restaurar página' });
    expect(restoreButton).toBeEnabled();
    expect(restoreButton.closest('.cifraink-panel')).toBeNull();
    expect(screen.queryByRole('region', { name: /Cabeçalho|Conteúdo|Diagramas/ })).toBeNull();
  });

  it('recolhe e reabre mantendo a marca visível', () => {
    render(<Panel capabilities={createCapabilities('compatible')} onRestore={() => {}} />);

    const collapseButton = screen.getByRole('button', { name: 'Recolher painel' });
    const collapseIcon = collapseButton.querySelector('path')?.getAttribute('d');
    fireEvent.click(collapseButton);

    const collapsedPanel = screen.getByRole('region', { name: 'CifraInk' });
    const openButton = screen.getByRole('button', { name: 'Abrir painel' });
    expect(collapsedPanel).toHaveAttribute('data-collapsed', 'true');
    expect(openButton).toHaveAttribute('aria-expanded', 'false');
    expect(openButton.querySelector('path')).not.toHaveAttribute('d', collapseIcon);
    expect(screen.getByText('CifraInk')).toBeVisible();
    expect(screen.getByRole('status', { hidden: true })).not.toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Restaurar página', hidden: true }),
    ).not.toBeVisible();

    openButton.focus();
    fireEvent.click(openButton);

    expect(screen.getByRole('button', { name: 'Recolher painel' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('status')).toBeVisible();
  });

  it.each(Object.entries(compatibilityMessages))(
    'exibe o estado %s sem detalhes técnicos',
    (status, message) => {
      render(
        <Panel
          capabilities={createCapabilities(status as PageCompatibility)}
          onRestore={() => {}}
        />,
      );

      const panel = screen.getByRole('region', { name: 'CifraInk' });
      const statusElement = screen.getByRole('status');
      expect(panel).toHaveAttribute('data-compatibility', status);
      expect(statusElement).toHaveTextContent(message);
      expect(statusElement.textContent).not.toMatch(/selector|exception|data-print-scroll/i);
    },
  );

  it('delega a restauração sem conhecer o DOM da página', () => {
    const onRestore = vi.fn();
    render(<Panel capabilities={createCapabilities('compatible')} onRestore={onRestore} />);

    fireEvent.click(screen.getByRole('button', { name: 'Restaurar página' }));

    expect(onRestore).toHaveBeenCalledOnce();
  });
});

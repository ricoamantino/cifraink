import { Heading01Icon } from '@hugeicons/core-free-icons';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ControlGroup } from '../../src/components/ControlGroup';
import { ControlRow } from '../../src/components/ControlRow';
import { FieldToggle } from '../../src/components/FieldToggle';
import { RestoreButton } from '../../src/components/RestoreButton';
import { SidePopover } from '../../src/components/SidePopover';
import { Status, StatusNotice } from '../../src/components/Status';
import { TextField } from '../../src/components/TextField';

describe('componentes do painel', () => {
  it('associa o título à seção semântica', () => {
    render(
      <ControlGroup title="Cabeçalho">
        <p>Conteúdo da seção</p>
      </ControlGroup>,
    );

    expect(screen.getByRole('region', { name: 'Cabeçalho' })).toHaveTextContent(
      'Conteúdo da seção',
    );
    expect(screen.getByRole('heading', { name: 'Cabeçalho' })).toHaveClass(
      'cifraink-visually-hidden',
    );
  });

  it('relaciona uma linha compacta ao popover lateral nativo', () => {
    render(
      <ControlRow
        icon={Heading01Icon}
        label="Título"
        popoverTarget="editor-titulo"
        value="Canção longa"
      >
        <SidePopover id="editor-titulo" label="Editar título">
          <TextField focusOnPopoverOpen label="Título" onChange={() => {}} value="Canção longa" />
        </SidePopover>
      </ControlRow>,
    );

    const trigger = screen.getByRole('button', { name: 'TítuloCanção longa' });
    const popover = document.getElementById('editor-titulo');
    expect(trigger).toHaveAttribute('popovertarget', 'editor-titulo');
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(popover).toHaveAttribute('popover', 'auto');
    expect(popover).toHaveAttribute('data-variant', 'editor');
  });

  it('foca o controle principal quando o popover é aberto', () => {
    render(
      <SidePopover id="editor" label="Editar título">
        <TextField focusOnPopoverOpen label="Título" onChange={() => {}} value="Original" />
      </SidePopover>,
    );

    const popover = document.getElementById('editor');
    const toggleEvent = new Event('toggle', { bubbles: true });
    Object.defineProperty(toggleEvent, 'newState', { value: 'open' });
    if (popover) {
      fireEvent(popover, toggleEvent);
    }

    expect(screen.getByRole('textbox', { hidden: true, name: 'Título' })).toHaveFocus();
  });

  it('devolve o foco ao acionador quando o popover fecha por Escape', () => {
    render(
      <ControlRow icon={Heading01Icon} label="Título" popoverTarget="editor" value="Original">
        <SidePopover id="editor" label="Editar título">
          <TextField focusOnPopoverOpen label="Título" onChange={() => {}} value="Original" />
        </SidePopover>
      </ControlRow>,
    );

    const trigger = screen.getByRole('button', { name: 'TítuloOriginal' });
    const popover = document.getElementById('editor');
    const input = screen.getByRole('textbox', { hidden: true, name: 'Título' });
    input.focus();
    fireEvent.keyDown(input, { key: 'Escape' });

    const toggleEvent = new Event('toggle', { bubbles: true });
    Object.defineProperty(toggleEvent, 'newState', { value: 'closed' });
    if (popover) {
      fireEvent(popover, toggleEvent);
    }

    expect(trigger).toHaveFocus();
  });

  it('reinicia o scroll e foca a primeira opção de um seletor rolável', () => {
    render(
      <SidePopover id="diagramas" label="Diagramas" scrollable>
        <div className="cifraink-diagram-options">
          <FieldToggle checked label="A" onChange={() => {}} />
          <FieldToggle checked={false} label="Bm" onChange={() => {}} />
        </div>
      </SidePopover>,
    );

    const popover = document.getElementById('diagramas');
    const scrollContainer = popover?.querySelector<HTMLElement>('.cifraink-diagram-options');
    const toggleEvent = new Event('toggle', { bubbles: true });
    Object.defineProperty(toggleEvent, 'newState', { value: 'open' });
    if (scrollContainer) {
      scrollContainer.scrollTop = 80;
    }
    if (popover) {
      fireEvent(popover, toggleEvent);
    }

    expect(popover).toHaveAttribute('data-variant', 'selection');
    expect(scrollContainer?.scrollTop).toBe(0);
    expect(screen.getByRole('switch', { hidden: true, name: 'A' })).toHaveFocus();
  });

  it('expõe um controle de visibilidade associado ao label e à descrição', () => {
    const onChange = vi.fn();
    render(
      <FieldToggle
        checked={false}
        description="Mostra ou oculta o título."
        label="Título"
        onChange={onChange}
      />,
    );

    const toggle = screen.getByRole('switch', { name: 'Título' });
    expect(toggle).not.toBeChecked();
    expect(toggle).toHaveAccessibleDescription('Mostra ou oculta o título.');

    fireEvent.click(toggle);

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('impede interação quando o controle de visibilidade está desabilitado', () => {
    const onChange = vi.fn();
    render(<FieldToggle checked={false} disabled label="Compositor" onChange={onChange} />);

    const toggle = screen.getByRole('switch', { name: 'Compositor' });
    expect(toggle).toBeDisabled();

    toggle.click();

    expect(onChange).not.toHaveBeenCalled();
  });

  it('edita um campo de texto controlado com label associado', () => {
    const onChange = vi.fn();
    const { rerender } = render(<TextField label="Título" onChange={onChange} value="Original" />);

    const input = screen.getByRole('textbox', { name: 'Título' });
    fireEvent.change(input, { target: { value: 'Novo título' } });

    expect(onChange).toHaveBeenCalledWith('Novo título');

    rerender(<TextField disabled label="Título" onChange={onChange} value="Novo título" />);
    expect(screen.getByRole('textbox', { name: 'Título' })).toBeDisabled();
  });

  it('oculta somente a apresentação do label quando solicitado', () => {
    render(
      <TextField label="Artista" onChange={() => {}} value="Nome original" visuallyHideLabel />,
    );

    const input = screen.getByRole('textbox', { name: 'Artista' });
    const label = document.querySelector(`label[for="${input.id}"]`);

    expect(label).toHaveClass('cifraink-visually-hidden');
    expect(input).toHaveAccessibleName('Artista');
  });

  it.each([
    ['compatible', 'CifraInk pronto para editar esta cifra.'],
    ['partial', 'CifraInk disponível com alguns recursos limitados.'],
    ['incompatible', 'Esta página não é compatível com o CifraInk.'],
  ] as const)('apresenta o status %s sem detalhes técnicos', (status, message) => {
    render(<Status status={status} />);

    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveTextContent(message);
    expect(statusElement.textContent).not.toMatch(/selector|exception|data-print-scroll/i);
  });

  it('exibe aviso textual somente quando a compatibilidade exige atenção', () => {
    const { rerender } = render(<StatusNotice status="compatible" />);
    expect(document.querySelector('.cifraink-status-notice')).toBeNull();

    rerender(<StatusNotice status="partial" />);
    expect(document.querySelector('.cifraink-status-notice')).toHaveTextContent(
      'CifraInk disponível com alguns recursos limitados.',
    );
  });

  it('executa a restauração e respeita o estado desabilitado', () => {
    const onRestore = vi.fn();
    const { rerender } = render(<RestoreButton onRestore={onRestore} />);

    const restoreButton = screen.getByRole('button', { name: 'Restaurar página' });
    expect(restoreButton.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    fireEvent.click(restoreButton);
    expect(onRestore).toHaveBeenCalledOnce();

    rerender(<RestoreButton disabled onRestore={onRestore} />);
    fireEvent.click(screen.getByRole('button', { name: 'Restaurar página' }));
    expect(onRestore).toHaveBeenCalledOnce();
  });
});

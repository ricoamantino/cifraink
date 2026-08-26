import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FieldToggle } from '../../src/components/FieldToggle';
import { RestoreButton } from '../../src/components/RestoreButton';
import { Section } from '../../src/components/Section';
import { Status } from '../../src/components/Status';
import { TextField } from '../../src/components/TextField';

describe('componentes do painel', () => {
  it('associa o título à seção semântica', () => {
    render(
      <Section title="Cabeçalho">
        <p>Conteúdo da seção</p>
      </Section>,
    );

    expect(screen.getByRole('region', { name: 'Cabeçalho' })).toHaveTextContent(
      'Conteúdo da seção',
    );
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

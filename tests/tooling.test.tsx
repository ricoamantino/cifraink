import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

describe('infraestrutura de testes', () => {
  it('renderiza e consulta um controle React acessível', () => {
    render(<button type="button">Preparar cifra</button>);

    expect(screen.getByRole('button', { name: 'Preparar cifra' })).toBeInTheDocument();
  });
});

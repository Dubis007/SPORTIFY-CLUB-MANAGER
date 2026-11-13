import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';

const handleLogin = vi.fn();

vi.mock('../../viewmodels/useLoginViewModel', () => ({
  useLoginViewModel: () => ({ handleLogin, loading: false, error: null }),
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el logotipo del proyecto con dimensiones fijas, sin depender del antiguo /vite.svg', () => {
    renderLogin();

    const logo = screen.getByAltText('Logotipo institucional de Sportify Club Manager');
    // Vite incrusta los SVG pequeños como data URI; en desarrollo los sirve por su ruta
    const src = logo.getAttribute('src') ?? '';
    expect(src).toMatch(/^data:image\/svg\+xml|sportify-logo/);
    expect(src).not.toMatch(/vite\.svg/);
    expect(logo).toHaveAttribute('width', '28');
    expect(logo).toHaveAttribute('height', '28');
  });

  it('rechaza un correo con formato inválido, lo explica junto al campo y no intenta iniciar sesión', async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText('Correo Institucional'), {
      target: { value: 'correo-sin-arroba' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Admin123!' } });
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    expect(await screen.findByText('Debe ser un correo electrónico válido')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo Institucional')).toHaveAttribute('aria-invalid', 'true');
    expect(handleLogin).not.toHaveBeenCalled();
  });

  it('envía las credenciales cuando el correo y la contraseña son válidos', async () => {
    renderLogin();

    fireEvent.change(screen.getByLabelText('Correo Institucional'), {
      target: { value: 'admin@sportify.com' },
    });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Admin123!' } });
    fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

    await waitFor(() => {
      expect(handleLogin).toHaveBeenCalledWith('admin@sportify.com', 'Admin123!');
    });
  });
});

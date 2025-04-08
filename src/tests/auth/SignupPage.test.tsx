import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import SignupPage from '../../pages/SignupPage';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <BrowserRouter>
        <AuthProvider>
          <SignupPage />
        </AuthProvider>
      </BrowserRouter>
    );
  });

  it('renders signup form', () => {
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tenant/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /landlord/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('handles successful signup', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: { id: '123', email: 'john@example.com' } },
      error: null,
    } as any);

    vi.mocked(supabase.from).mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    } as any);

    const fullNameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const tenantButton = screen.getByRole('button', { name: /tenant/i });
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(tenantButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Account created successfully!');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('handles signup failure', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Signup failed'),
    } as any);

    const fullNameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });

    fireEvent.change(fullNameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create account. Please try again.');
    });
  });

  it('validates required fields', async () => {
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    // Trigger form submission without filling in fields
    fireEvent.click(submitButton);

    const fullNameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    // Check if the inputs are marked as required
    expect(fullNameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('toggles between tenant and landlord roles', () => {
    const tenantButton = screen.getByRole('button', { name: /tenant/i });
    const landlordButton = screen.getByRole('button', { name: /landlord/i });

    // Initial state - tenant should be selected
    expect(tenantButton.className).toMatch(/bg-primary/);
    expect(landlordButton.className).not.toMatch(/bg-primary/);

    // Click landlord button
    fireEvent.click(landlordButton);

    // Verify landlord is now selected
    expect(tenantButton.className).not.toMatch(/bg-primary/);
    expect(landlordButton.className).toMatch(/bg-primary/);

    // Click tenant button again
    fireEvent.click(tenantButton);

    // Verify tenant is selected again
    expect(tenantButton.className).toMatch(/bg-primary/);
    expect(landlordButton.className).not.toMatch(/bg-primary/);
  });
});
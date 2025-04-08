import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import ReviewSection from '../../components/ReviewSection';
import toast from 'react-hot-toast';

const mockUser = {
  id: '123',
  email: 'test@example.com',
};

const mockProfile = {
  id: '123',
  full_name: 'Test User',
  role: 'tenant',
  phone: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockReviews = [
  {
    id: '1',
    property_id: 'prop123',
    user_id: '123',
    rating: 4,
    comment: 'Great place!',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    reviewer_name: 'Test User',
  },
];

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    profile: mockProfile,
  })),
}));

describe('ReviewSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    render(
      <BrowserRouter>
        <ReviewSection propertyId="prop123" />
      </BrowserRouter>
    );
  });

  it('renders review form for authenticated users', () => {
    expect(screen.getByText(/write a review/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/comment/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit review/i })).toBeInTheDocument();
  });

  it('handles successful review submission', async () => {
    const commentInput = screen.getByLabelText(/comment/i);
    const submitButton = screen.getByRole('button', { name: /submit review/i });

    fireEvent.change(commentInput, { target: { value: 'Great property!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Review submitted successfully!');
    });
  });

  it('handles review submission failure', async () => {
    const commentInput = screen.getByLabelText(/comment/i);
    const submitButton = screen.getByRole('button', { name: /submit review/i });

    vi.spyOn(console, 'error').mockImplementation(() => {});
    const mockSubmit = vi.fn().mockRejectedValue(new Error('Submission failed'));

    fireEvent.change(commentInput, { target: { value: 'Great property!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to submit review');
    });
  });

  it('allows editing existing review', async () => {
    // First, render with an existing review
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(screen.getByText(/edit your review/i)).toBeInTheDocument();
    
    const commentInput = screen.getByLabelText(/comment/i);
    const saveButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(commentInput, { target: { value: 'Updated review!' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Review updated successfully!');
    });
  });

  it('allows deleting review', async () => {
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Review deleted successfully!');
    });
  });

  it('displays login prompt for unauthenticated users', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      profile: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    render(
      <BrowserRouter>
        <ReviewSection propertyId="prop123" />
      </BrowserRouter>
    );

    expect(screen.getByText(/please log in to leave a review/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument();
  });
});
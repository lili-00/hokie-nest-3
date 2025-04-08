import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import PropertiesPage from '../../pages/PropertiesPage';
import { supabase } from '../../lib/supabase';

const mockProperties = [
  {
    id: '1',
    title: 'Modern Apartment',
    description: 'A beautiful modern apartment',
    address: '123 Main St',
    price: 1500,
    bedrooms: 2,
    bathrooms: 2,
    square_feet: 1000,
    location: 'Downtown',
    landlord_id: 'landlord123',
    status: 'available',
    amenities: ['Washer/Dryer', 'Parking'],
    highlights: ['Near campus', 'Pet friendly'],
    images: ['https://example.com/image.jpg'],
    is_furnished: true,
    transportation: {},
    landlord_name: 'John Doe',
    landlord_email: 'john@example.com',
    landlord_phone: '123-456-7890',
    reviews_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

describe('PropertiesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockProperties, error: null }),
    } as any);

    render(
      <BrowserRouter>
        <AuthProvider>
          <PropertiesPage />
        </AuthProvider>
      </BrowserRouter>
    );
  });

  it('renders properties list', async () => {
    await waitFor(() => {
      expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
      expect(screen.getByText('Downtown')).toBeInTheDocument();
      expect(screen.getByText('$1,500/mo')).toBeInTheDocument();
    });
  });

  it('filters properties by search term', async () => {
    await waitFor(() => {
      expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search properties/i);
    fireEvent.change(searchInput, { target: { value: 'modern' } });

    expect(screen.getByText('Modern Apartment')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText(/no properties found/i)).toBeInTheDocument();
    });
  });

  it('filters properties by furnished status', async () => {
    await waitFor(() => {
      expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
    });

    const filtersButton = screen.getByRole('button', { name: /filters/i });
    fireEvent.click(filtersButton);

    const furnishedCheckbox = screen.getByLabelText(/furnished only/i);
    fireEvent.click(furnishedCheckbox);

    expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
  });

  it('resets filters', async () => {
    await waitFor(() => {
      expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
    });

    const filtersButton = screen.getByRole('button', { name: /filters/i });
    fireEvent.click(filtersButton);

    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);

    expect(screen.getByText('Modern Apartment')).toBeInTheDocument();
  });
});
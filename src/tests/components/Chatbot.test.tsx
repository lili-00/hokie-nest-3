import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Chatbot from '../../components/Chatbot';

describe('Chatbot', () => {
  beforeEach(() => {
    render(<Chatbot />);
  });

  it('renders chat button initially', () => {
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens chat window when button is clicked', () => {
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Housing Assistant')).toBeInTheDocument();
  });

  it('shows initial welcome message', () => {
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText(/Hi! I'm your housing assistant/)).toBeInTheDocument();
  });

  it('displays quick questions', () => {
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('What areas are available?')).toBeInTheDocument();
    expect(screen.getByText('What\'s the average rent?')).toBeInTheDocument();
  });

  it('handles user input and shows response', async () => {
    const button = screen.getByRole('button');
    fireEvent.click(button);

    const input = screen.getByPlaceholderText('Type your message...');
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: 'What areas are available?' } });
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText(/Potomac Yard/)).toBeInTheDocument();
    });
  });

  it('shows typing indicator while processing response', async () => {
    const button = screen.getByRole('button');
    fireEvent.click(button);

    const input = screen.getByPlaceholderText('Type your message...');
    const form = input.closest('form')!;

    fireEvent.change(input, { target: { value: 'test message' } });
    fireEvent.submit(form);

    // Check for loading indicator
    const loader = await screen.findByRole('generic', { hidden: true });
    expect(loader).toBeInTheDocument();

    // Wait for response
    await waitFor(() => {
      expect(screen.getByText(/Could you please be more specific/)).toBeInTheDocument();
    });
  });

  it('handles quick question selection', async () => {
    const button = screen.getByRole('button');
    fireEvent.click(button);

    const quickQuestion = screen.getByText('What areas are available?');
    fireEvent.click(quickQuestion);

    await waitFor(() => {
      expect(screen.getByText(/Potomac Yard/)).toBeInTheDocument();
    });
  });

  it('closes chat window', () => {
    const openButton = screen.getByRole('button');
    fireEvent.click(openButton);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(screen.queryByText('Housing Assistant')).not.toBeInTheDocument();
  });
});
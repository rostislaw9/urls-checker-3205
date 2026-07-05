import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { JobsState } from '../../store/jobsStore';
import { useJobsStore } from '../../store/jobsStore';
import { JobForm } from './JobForm';

vi.mock('../../store/jobsStore');

const mockStore = (overrides: Partial<JobsState> = {}) => {
  const state: JobsState = {
    jobs: [],
    activeJob: null,
    loading: false,
    creating: false,
    error: null,
    polling: false,
    fetchJobs: vi.fn(),
    createJob: vi.fn(),
    selectJob: vi.fn(),
    cancelJob: vi.fn(),
    setActiveJob: vi.fn(),
    updateActiveJob: vi.fn(),
    clearError: vi.fn(),
    setError: vi.fn(),
    setPolling: vi.fn(),
    ...overrides,
  };
  vi.mocked(useJobsStore).mockImplementation((selector) => (selector ? selector(state) : state));
  return state;
};

describe('JobForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore();
  });

  it('should render form with textarea and button', () => {
    render(<JobForm />);
    expect(screen.getByPlaceholderText(/Введите URL/)).toBeInTheDocument();
    expect(screen.getByText('Запустить проверку')).toBeInTheDocument();
  });

  it('should disable button when textarea is empty', () => {
    render(<JobForm />);
    expect(screen.getByText('Запустить проверку')).toBeDisabled();
  });

  it('should enable button when textarea has content', () => {
    render(<JobForm />);
    const textarea = screen.getByPlaceholderText(/Введите URL/);
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });
    expect(screen.getByText('Запустить проверку')).toBeEnabled();
  });

  it('should call createJob with parsed URLs on submit', async () => {
    const mockCreateJob = vi.fn();
    mockStore({ createJob: mockCreateJob });

    render(<JobForm />);
    const textarea = screen.getByPlaceholderText(/Введите URL/);
    fireEvent.change(textarea, {
      target: { value: 'https://example.com\nhttps://google.com' },
    });
    fireEvent.click(screen.getByText('Запустить проверку'));

    await waitFor(() => {
      expect(mockCreateJob).toHaveBeenCalledWith({
        urls: ['https://example.com', 'https://google.com'],
      });
    });
  });

  it('should show Creating... text when creating', () => {
    mockStore({ creating: true });
    render(<JobForm />);
    expect(screen.getByText('Создание...')).toBeInTheDocument();
  });
});

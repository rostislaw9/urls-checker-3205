import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./store/jobsStore', () => ({
  useJobsStore: vi.fn((selector) => {
    const state = {
      jobs: [],
      activeJob: null,
      loading: false,
      creating: false,
      error: null,
      polling: false,
      fetchJobs: vi.fn(),
      selectJob: vi.fn(),
      cancelJob: vi.fn(),
      createJob: vi.fn(),
      setActiveJob: vi.fn(),
      updateActiveJob: vi.fn(),
      clearError: vi.fn(),
      setError: vi.fn(),
      setPolling: vi.fn(),
    };
    return selector ? selector(state) : state;
  }),
}));

vi.mock('./hooks/usePolling', () => ({
  usePolling: vi.fn(),
}));

describe('App', () => {
  it('should render the title', () => {
    render(<App />);
    expect(screen.getByText('URLs Checker')).toBeInTheDocument();
  });
});

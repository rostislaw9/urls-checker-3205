import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { JobsState } from '../../store/jobsStore';
import { useJobsStore } from '../../store/jobsStore';
import type { Job } from '../../types';
import { JobStatus, UrlStatus } from '../../types';
import { JobDetails } from './JobDetails';

vi.mock('../../store/jobsStore');

const mockJob: Job = {
  id: 'job-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  status: JobStatus.IN_PROGRESS,
  urls: [
    {
      url: 'https://example.com',
      status: UrlStatus.SUCCESS,
      httpStatus: 200,
      error: null,
      startedAt: '2026-01-01T00:00:00.000Z',
      finishedAt: '2026-01-01T00:00:05.000Z',
      durationMs: 5000,
    },
    {
      url: 'https://broken.com',
      status: UrlStatus.ERROR,
      httpStatus: null,
      error: 'Connection refused',
      startedAt: '2026-01-01T00:00:00.000Z',
      finishedAt: '2026-01-01T00:00:03.000Z',
      durationMs: 3000,
    },
    {
      url: 'https://pending.com',
      status: UrlStatus.PENDING,
      httpStatus: null,
      error: null,
      startedAt: null,
      finishedAt: null,
      durationMs: null,
    },
  ],
};

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

describe('JobDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore();
  });

  it('should render job id and status', () => {
    render(<JobDetails job={mockJob} />);
    expect(screen.getByText('Детали задания')).toBeInTheDocument();
    expect(screen.getByText('job-1')).toBeInTheDocument();
  });

  it('should show progress bar', () => {
    render(<JobDetails job={mockJob} />);
    expect(screen.getByText(/URL проверено/)).toBeInTheDocument();
  });

  it('should show stats', () => {
    render(<JobDetails job={mockJob} />);
    expect(screen.getAllByText('Успешно').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ошибки').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ожидают').length).toBeGreaterThan(0);
  });

  it('should render URL table with all URLs', () => {
    render(<JobDetails job={mockJob} />);
    expect(screen.getByText('https://example.com')).toBeInTheDocument();
    expect(screen.getByText('https://broken.com')).toBeInTheDocument();
    expect(screen.getByText('https://pending.com')).toBeInTheDocument();
  });

  it('should show cancel button for in_progress job', () => {
    render(<JobDetails job={mockJob} />);
    expect(screen.getByText('Отменить задание')).toBeInTheDocument();
  });

  it('should not show cancel button for completed job', () => {
    const completedJob = { ...mockJob, status: JobStatus.COMPLETED };
    render(<JobDetails job={completedJob} />);
    expect(screen.queryByText('Отменить задание')).not.toBeInTheDocument();
  });

  it('should call cancelJob when cancel button is clicked', () => {
    const mockCancelJob = vi.fn();
    mockStore({ cancelJob: mockCancelJob });

    render(<JobDetails job={mockJob} />);
    fireEvent.click(screen.getByText('Отменить задание'));
    expect(mockCancelJob).toHaveBeenCalledWith('job-1');
  });
});

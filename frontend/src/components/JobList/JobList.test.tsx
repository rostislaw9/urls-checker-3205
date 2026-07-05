import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JobList } from './JobList';
import type { Job } from '../../types';
import { JobStatus, UrlStatus } from '../../types';

const mockJob: Job = {
  id: 'job-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  status: JobStatus.COMPLETED,
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
  ],
};

describe('JobList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show empty state when no jobs', () => {
    render(<JobList jobs={[]} activeJobId={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Заданий нет')).toBeInTheDocument();
  });

  it('should render job items', () => {
    render(<JobList jobs={[mockJob]} activeJobId={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Задания (1)')).toBeInTheDocument();
    expect(screen.getByText('1 URL')).toBeInTheDocument();
  });

  it('should call onSelect when job item is clicked', () => {
    const onSelect = vi.fn();
    render(<JobList jobs={[mockJob]} activeJobId={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('1 URL').closest('div')!);
    expect(onSelect).toHaveBeenCalledWith('job-1');
  });
});

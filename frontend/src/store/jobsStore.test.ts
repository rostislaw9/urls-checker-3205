import { beforeEach, describe, expect, it, vi } from 'vitest';
import { jobsApi } from '../api/jobsApi';
import type { Job } from '../types';
import { JobStatus, UrlStatus } from '../types';
import { useJobsStore } from './jobsStore';

vi.mock('../api/jobsApi');

const mockJob: Job = {
  id: 'job-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  status: JobStatus.IN_PROGRESS,
  urls: [
    {
      url: 'https://example.com',
      status: UrlStatus.IN_PROGRESS,
      httpStatus: null,
      error: null,
      startedAt: '2026-01-01T00:00:00.000Z',
      finishedAt: null,
      durationMs: null,
    },
  ],
};

describe('jobsStore', () => {
  beforeEach(() => {
    useJobsStore.setState({
      jobs: [],
      activeJob: null,
      loading: false,
      creating: false,
      error: null,
      polling: false,
    });
    vi.clearAllMocks();
  });

  describe('fetchJobs', () => {
    it('should fetch jobs successfully', async () => {
      vi.mocked(jobsApi.getJobs).mockResolvedValue([mockJob]);

      await useJobsStore.getState().fetchJobs();

      expect(useJobsStore.getState().jobs).toEqual([mockJob]);
      expect(useJobsStore.getState().loading).toBe(false);
      expect(useJobsStore.getState().error).toBe(null);
    });

    it('should set error on fetch failure', async () => {
      vi.mocked(jobsApi.getJobs).mockRejectedValue(new Error('Network error'));

      await useJobsStore.getState().fetchJobs();

      expect(useJobsStore.getState().loading).toBe(false);
      expect(useJobsStore.getState().error).toBe('Network error');
    });
  });

  describe('createJob', () => {
    it('should create job successfully', async () => {
      vi.mocked(jobsApi.createJob).mockResolvedValue('job-1');
      vi.mocked(jobsApi.getJob).mockResolvedValue(mockJob);

      await useJobsStore.getState().createJob({ urls: ['https://example.com'] });

      expect(jobsApi.createJob).toHaveBeenCalledWith({ urls: ['https://example.com'] });
      expect(jobsApi.getJob).toHaveBeenCalledWith('job-1');
      expect(useJobsStore.getState().jobs).toEqual([mockJob]);
      expect(useJobsStore.getState().activeJob).toEqual(mockJob);
      expect(useJobsStore.getState().creating).toBe(false);
    });

    it('should set error on create failure', async () => {
      vi.mocked(jobsApi.createJob).mockRejectedValue(new Error('Create failed'));

      await useJobsStore.getState().createJob({ urls: ['https://example.com'] });

      expect(useJobsStore.getState().creating).toBe(false);
      expect(useJobsStore.getState().error).toBe('Create failed');
    });

    it('should extract and translate backend validation message from AxiosError', async () => {
      const axiosError = Object.assign(new Error('Request failed'), {
        response: { data: { message: 'each value in urls must be a URL address' } },
      });
      vi.mocked(jobsApi.createJob).mockRejectedValue(axiosError);

      await useJobsStore.getState().createJob({ urls: ['invalid'] });

      expect(useJobsStore.getState().error).toBe(
        'Каждый URL должен начинаться с http:// или https://',
      );
    });
  });

  describe('selectJob', () => {
    it('should select job successfully', async () => {
      vi.mocked(jobsApi.getJob).mockResolvedValue(mockJob);

      await useJobsStore.getState().selectJob('job-1');

      expect(useJobsStore.getState().activeJob).toEqual(mockJob);
      expect(useJobsStore.getState().loading).toBe(false);
    });

    it('should set error on select failure', async () => {
      vi.mocked(jobsApi.getJob).mockRejectedValue(new Error('Not found'));

      await useJobsStore.getState().selectJob('nonexistent');

      expect(useJobsStore.getState().error).toBe('Not found');
    });
  });

  describe('cancelJob', () => {
    it('should cancel job successfully', async () => {
      const cancelledJob = { ...mockJob, status: JobStatus.CANCELLED };
      useJobsStore.setState({ jobs: [mockJob], activeJob: mockJob });
      vi.mocked(jobsApi.cancelJob).mockResolvedValue(cancelledJob);

      await useJobsStore.getState().cancelJob('job-1');

      expect(useJobsStore.getState().jobs[0].status).toBe(JobStatus.CANCELLED);
      expect(useJobsStore.getState().activeJob?.status).toBe(JobStatus.CANCELLED);
    });
  });

  describe('updateActiveJob', () => {
    it('should update active job and jobs list if id matches', () => {
      useJobsStore.setState({ activeJob: mockJob, jobs: [mockJob] });
      const updated = { ...mockJob, status: JobStatus.COMPLETED };

      useJobsStore.getState().updateActiveJob(updated);

      expect(useJobsStore.getState().activeJob?.status).toBe(JobStatus.COMPLETED);
      expect(useJobsStore.getState().jobs[0].status).toBe(JobStatus.COMPLETED);
    });

    it('should not update active job if id does not match', () => {
      useJobsStore.setState({ activeJob: mockJob });
      const otherJob = { ...mockJob, id: 'job-2', status: JobStatus.COMPLETED };

      useJobsStore.getState().updateActiveJob(otherJob);

      expect(useJobsStore.getState().activeJob?.status).toBe(JobStatus.IN_PROGRESS);
    });
  });

  describe('setActiveJob', () => {
    it('should set active job and stop polling', () => {
      useJobsStore.setState({ polling: true });

      useJobsStore.getState().setActiveJob(mockJob);

      expect(useJobsStore.getState().activeJob).toEqual(mockJob);
      expect(useJobsStore.getState().polling).toBe(false);
    });
  });
});

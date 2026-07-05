import type { AxiosError } from 'axios';
import { create } from 'zustand';
import { jobsApi } from '../api/jobsApi';
import type { CreateJobDto, Job } from '../types';
import { JobStatus } from '../types';

interface BackendError {
  message?: string;
  error?: string;
}

const VALIDATION_MESSAGES: Record<string, string> = {
  'urls must be an array': 'URL должны быть переданы массивом',
  'urls must contain at least 1 elements': 'Введите хотя бы один URL',
  'each value in urls must be a string': 'Каждый URL должен быть строкой',
  'each value in urls should not be empty': 'URL не может быть пустым',
  'each value in urls must be a URL address': 'Каждый URL должен начинаться с http:// или https://',
};

function translateValidation(message: string): string {
  for (const [en, ru] of Object.entries(VALIDATION_MESSAGES)) {
    if (message.includes(en)) return ru;
  }
  return message;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    const axiosError = error as AxiosError<BackendError>;
    if (axiosError.response?.data?.message) {
      const msg = axiosError.response.data.message;
      const text = Array.isArray(msg) ? msg.join(', ') : msg;
      return translateValidation(text);
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    return error.message;
  }
  return fallback;
}

export interface JobsState {
  jobs: Job[];
  activeJob: Job | null;
  loading: boolean;
  creating: boolean;
  error: string | null;
  polling: boolean;

  fetchJobs: () => Promise<void>;
  createJob: (dto: CreateJobDto) => Promise<void>;
  selectJob: (id: string) => Promise<void>;
  cancelJob: (id: string) => Promise<void>;
  setActiveJob: (job: Job | null) => void;
  updateActiveJob: (job: Job) => void;
  clearError: () => void;
  setError: (error: string) => void;
  setPolling: (polling: boolean) => void;
}

const isTerminalStatus = (status: JobStatus): boolean =>
  status === JobStatus.COMPLETED || status === JobStatus.FAILED || status === JobStatus.CANCELLED;

export const useJobsStore = create<JobsState>((set, get) => ({
  jobs: [],
  activeJob: null,
  loading: false,
  creating: false,
  error: null,
  polling: false,

  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const jobs = await jobsApi.getJobs();
      set({ jobs, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: extractErrorMessage(error, 'Не удалось получить список заданий'),
      });
    }
  },

  createJob: async (dto: CreateJobDto) => {
    set({ creating: true, error: null });
    try {
      const jobId = await jobsApi.createJob(dto);
      const job = await jobsApi.getJob(jobId);
      set((state) => ({
        jobs: [job, ...state.jobs],
        activeJob: job,
        creating: false,
      }));
    } catch (error) {
      set({
        creating: false,
        error: extractErrorMessage(error, 'Не удалось создать задание'),
      });
    }
  },

  selectJob: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const job = await jobsApi.getJob(id);
      set({ activeJob: job, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: extractErrorMessage(error, 'Не удалось получить задание'),
      });
    }
  },

  cancelJob: async (id: string) => {
    set({ error: null });
    try {
      const job = await jobsApi.cancelJob(id);
      set((state) => ({
        jobs: state.jobs.map((j) => (j.id === id ? job : j)),
        activeJob: state.activeJob?.id === id ? job : state.activeJob,
      }));
    } catch (error) {
      set({
        error: extractErrorMessage(error, 'Не удалось отменить задание'),
      });
    }
  },

  setActiveJob: (job: Job | null) => {
    set({ activeJob: job, polling: false });
  },

  updateActiveJob: (job: Job) => {
    const currentActive = get().activeJob;
    if (currentActive?.id === job.id) {
      set((state) => ({
        activeJob: job,
        jobs: state.jobs.map((j) => (j.id === job.id ? job : j)),
      }));
    }
  },

  clearError: () => set({ error: null }),
  setError: (error: string) => set({ error }),
  setPolling: (polling: boolean) => set({ polling }),
}));

export { isTerminalStatus };

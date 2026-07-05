import axios from 'axios';
import type { CreateJobDto, Job } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
});

export const jobsApi = {
  async createJob(dto: CreateJobDto): Promise<string> {
    const { data } = await api.post<{ jobId: string }>('/jobs', dto);
    return data.jobId;
  },

  async getJobs(): Promise<Job[]> {
    const { data } = await api.get<Job[]>('/jobs');
    return data;
  },

  async getJob(id: string): Promise<Job> {
    const { data } = await api.get<Job>(`/jobs/${id}`);
    return data;
  },

  async cancelJob(id: string): Promise<Job> {
    const { data } = await api.delete<Job>(`/jobs/${id}`);
    return data;
  },
};

import { Job } from '../models/job.model';

export interface IJobRepository {
  save(job: Job): void;
  findById(id: string): Job | null;
  findAll(): Job[];
  update(job: Job): void;
  delete(id: string): boolean;
}

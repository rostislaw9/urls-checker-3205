import { Injectable } from '@nestjs/common';
import { Job } from '../models/job.model';
import { IJobRepository } from '../interfaces/job-repository.interface';

@Injectable()
export class JobRepository implements IJobRepository {
  private readonly jobs = new Map<string, Job>();

  save(job: Job): void {
    this.jobs.set(job.id, job);
  }

  findById(id: string): Job | null {
    return this.jobs.get(id) ?? null;
  }

  findAll(): Job[] {
    return Array.from(this.jobs.values());
  }

  update(job: Job): void {
    this.jobs.set(job.id, job);
  }

  delete(id: string): boolean {
    return this.jobs.delete(id);
  }
}

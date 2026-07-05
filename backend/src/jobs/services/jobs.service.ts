import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateJobDto } from '../dto/create-job.dto';
import { JobStatus } from '../models/job-status.enum';
import { Job } from '../models/job.model';
import { UrlItem } from '../models/url-item.model';
import { QueueProcessor } from '../queue/queue.processor';
import { JobRepository } from '../repository/job.repository';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly jobRepository: JobRepository,
    private readonly queueProcessor: QueueProcessor,
  ) {}

  createJob(dto: CreateJobDto): Job {
    const id = randomUUID();
    const urls = dto.urls.map((url) => new UrlItem(url));
    const job = new Job(id, urls);

    this.jobRepository.save(job);
    this.logger.log(`Job created: ${id} with ${urls.length} URLs`);

    void this.queueProcessor.process(job);

    return job;
  }

  getAllJobs(): Job[] {
    return this.jobRepository
      .findAll()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getJobById(id: string): Job {
    const job = this.jobRepository.findById(id);
    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }
    return job;
  }

  cancelJob(id: string): Job {
    const job = this.jobRepository.findById(id);
    if (!job) {
      throw new NotFoundException(`Job with id ${id} not found`);
    }

    if (
      job.status === JobStatus.COMPLETED ||
      job.status === JobStatus.CANCELLED ||
      job.status === JobStatus.FAILED
    ) {
      return job;
    }

    this.queueProcessor.cancel(id);
    job.status = JobStatus.CANCELLED;
    this.jobRepository.update(job);
    this.logger.log(`Job cancelled: ${id}`);

    return job;
  }
}

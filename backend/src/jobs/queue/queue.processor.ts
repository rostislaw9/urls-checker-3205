import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { Job } from '../models/job.model';
import { UrlItem } from '../models/url-item.model';
import { JobStatus } from '../models/job-status.enum';
import { UrlStatus } from '../models/url-status.enum';
import { JobRepository } from '../repository/job.repository';
import { Semaphore } from '../utils/semaphore';
import { randomDelay } from '../utils/delay';

const MAX_CONCURRENT_REQUESTS = 5;
const HTTP_TIMEOUT_MS = 5000;

@Injectable()
export class QueueProcessor {
  private readonly logger = new Logger(QueueProcessor.name);
  private readonly cancelledJobs = new Set<string>();

  constructor(
    private readonly httpService: HttpService,
    private readonly jobRepository: JobRepository,
  ) {}

  cancel(jobId: string): void {
    this.cancelledJobs.add(jobId);
  }

  isCancelled(jobId: string): boolean {
    return this.cancelledJobs.has(jobId);
  }

  async process(job: Job): Promise<void> {
    job.status = JobStatus.IN_PROGRESS;
    this.jobRepository.update(job);
    this.logger.log(`Processing started: ${job.id}`);

    const semaphore = new Semaphore(MAX_CONCURRENT_REQUESTS);
    const abortController = new AbortController();

    const tasks = job.urls.map((urlItem) =>
      this.processUrl(job, urlItem, semaphore, abortController.signal),
    );

    try {
      await Promise.allSettled(tasks);
    } catch (error) {
      this.logger.error(`Processing error for job ${job.id}: ${String(error)}`);
    }

    if (this.isCancelled(job.id)) {
      job.status = JobStatus.CANCELLED;
      job.urls.forEach((url) => {
        if (url.status === UrlStatus.PENDING || url.status === UrlStatus.IN_PROGRESS) {
          url.status = UrlStatus.CANCELLED;
        }
      });
    } else {
      const hasErrors = job.urls.some((u) => u.status === UrlStatus.ERROR);
      job.status = hasErrors ? JobStatus.FAILED : JobStatus.COMPLETED;
    }

    this.jobRepository.update(job);
    this.cancelledJobs.delete(job.id);
    this.logger.log(`Processing finished: ${job.id}, status: ${job.status}`);
  }

  private async processUrl(
    job: Job,
    urlItem: UrlItem,
    semaphore: Semaphore,
    signal: AbortSignal,
  ): Promise<void> {
    if (this.isCancelled(job.id)) {
      urlItem.status = UrlStatus.CANCELLED;
      return;
    }

    await semaphore.acquire();

    try {
      if (this.isCancelled(job.id)) {
        urlItem.status = UrlStatus.CANCELLED;
        return;
      }

      urlItem.status = UrlStatus.IN_PROGRESS;
      urlItem.startedAt = new Date();
      this.jobRepository.update(job);

      await randomDelay();

      if (this.isCancelled(job.id)) {
        urlItem.status = UrlStatus.CANCELLED;
        urlItem.finishedAt = new Date();
        urlItem.durationMs = urlItem.finishedAt.getTime() - urlItem.startedAt.getTime();
        return;
      }

      try {
        const response = await firstValueFrom(
          this.httpService.head(urlItem.url, {
            timeout: HTTP_TIMEOUT_MS,
            maxRedirects: 5,
            signal,
          }),
        );

        urlItem.httpStatus = response.status;
        urlItem.status = UrlStatus.SUCCESS;
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          urlItem.httpStatus = axiosError.response.status;
        }
        urlItem.error = axiosError.message;
        urlItem.status = UrlStatus.ERROR;
      }

      urlItem.finishedAt = new Date();
      urlItem.durationMs = urlItem.finishedAt.getTime() - (urlItem.startedAt?.getTime() ?? 0);
      this.jobRepository.update(job);
    } finally {
      semaphore.release();
    }
  }
}

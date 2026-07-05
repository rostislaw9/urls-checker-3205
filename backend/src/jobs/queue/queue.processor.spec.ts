import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';
import { JobStatus } from '../models/job-status.enum';
import { Job } from '../models/job.model';
import { UrlItem } from '../models/url-item.model';
import { UrlStatus } from '../models/url-status.enum';
import { JobRepository } from '../repository/job.repository';
import { QueueProcessor } from './queue.processor';

jest.mock('../utils/delay', () => ({
  delay: jest.fn().mockResolvedValue(undefined),
  randomDelay: jest.fn().mockResolvedValue(undefined),
}));

describe('QueueProcessor', () => {
  let processor: QueueProcessor;
  let httpService: HttpService;
  let jobRepository: JobRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueProcessor,
        {
          provide: HttpService,
          useValue: {
            head: jest.fn().mockReturnValue(
              of({
                status: 200,
                data: '',
                statusText: 'OK',
                headers: {},
                config: {} as never,
              } as AxiosResponse),
            ),
          },
        },
        {
          provide: JobRepository,
          useValue: {
            save: jest.fn(),
            findById: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    processor = module.get<QueueProcessor>(QueueProcessor);
    httpService = module.get<HttpService>(HttpService);
    jobRepository = module.get<JobRepository>(JobRepository);
  });

  describe('process', () => {
    it('should process all URLs and mark job as completed when all succeed', async () => {
      const job = new Job('job-1', [
        new UrlItem('https://example.com'),
        new UrlItem('https://google.com'),
      ]);

      await processor.process(job);

      expect(job.status).toBe(JobStatus.COMPLETED);
      expect(job.urls[0].status).toBe(UrlStatus.SUCCESS);
      expect(job.urls[1].status).toBe(UrlStatus.SUCCESS);
      expect(job.urls[0].httpStatus).toBe(200);
      expect(job.urls[1].httpStatus).toBe(200);
      expect(job.urls[0].durationMs).not.toBeNull();
      expect(job.urls[1].durationMs).not.toBeNull();
    });

    it('should mark job as failed when some URLs have errors', async () => {
      const job = new Job('job-2', [new UrlItem('https://bad-url.com')]);

      jest
        .spyOn(httpService, 'head')
        .mockReturnValue(throwError(() => new Error('Connection refused')) as never);

      await processor.process(job);

      expect(job.status).toBe(JobStatus.FAILED);
      expect(job.urls[0].status).toBe(UrlStatus.ERROR);
      expect(job.urls[0].error).toBe('Connection refused');
    });

    it('should make HEAD requests for each URL', async () => {
      const job = new Job('job-3', [
        new UrlItem('https://example.com'),
        new UrlItem('https://test.com'),
      ]);

      await processor.process(job);

      expect(httpService.head).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ timeout: 5000, maxRedirects: 5 }),
      );
      expect(httpService.head).toHaveBeenCalledWith(
        'https://test.com',
        expect.objectContaining({ timeout: 5000, maxRedirects: 5 }),
      );
    });

    it('should set startedAt and finishedAt for each URL', async () => {
      const job = new Job('job-4', [new UrlItem('https://example.com')]);

      await processor.process(job);

      expect(job.urls[0].startedAt).toBeInstanceOf(Date);
      expect(job.urls[0].finishedAt).toBeInstanceOf(Date);
    });

    it('should update job status to in_progress at start', async () => {
      const job = new Job('job-5', [new UrlItem('https://example.com')]);
      const statuses: JobStatus[] = [];
      jest.spyOn(jobRepository, 'update').mockImplementation((updatedJob: Job) => {
        statuses.push(updatedJob.status);
      });

      await processor.process(job);

      expect(statuses).toContain(JobStatus.IN_PROGRESS);
    });
  });

  describe('concurrency', () => {
    it('should process multiple URLs', async () => {
      const urls = Array.from({ length: 10 }, (_, i) => new UrlItem(`https://example${i}.com`));
      const job = new Job('job-concurrent', urls);

      await processor.process(job);

      expect(job.urls.every((u) => u.status === UrlStatus.SUCCESS)).toBe(true);
      expect(httpService.head).toHaveBeenCalledTimes(10);
    });
  });
});

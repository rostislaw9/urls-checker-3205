import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
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

describe('QueueProcessor - Cancellation', () => {
  let processor: QueueProcessor;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueProcessor,
        {
          provide: HttpService,
          useValue: {
            head: jest.fn(),
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
  });

  it('should mark job as cancelled when cancelled before processing', async () => {
    const job = new Job('cancel-1', [
      new UrlItem('https://example.com'),
      new UrlItem('https://test.com'),
    ]);

    processor.cancel('cancel-1');
    await processor.process(job);

    expect(job.status).toBe(JobStatus.CANCELLED);
    expect(job.urls[0].status).toBe(UrlStatus.CANCELLED);
    expect(job.urls[1].status).toBe(UrlStatus.CANCELLED);
  });

  it('should not make HEAD requests for cancelled URLs', async () => {
    const job = new Job('cancel-2', [new UrlItem('https://example.com')]);

    processor.cancel('cancel-2');
    await processor.process(job);

    expect(httpService.head).not.toHaveBeenCalled();
  });

  it('should clear cancelled state after processing', async () => {
    const job = new Job('cancel-3', [new UrlItem('https://example.com')]);

    processor.cancel('cancel-3');
    await processor.process(job);

    expect(processor.isCancelled('cancel-3')).toBe(false);
  });

  it('should allow cancellation of multiple jobs independently', () => {
    processor.cancel('job-a');
    processor.cancel('job-b');

    expect(processor.isCancelled('job-a')).toBe(true);
    expect(processor.isCancelled('job-b')).toBe(true);
    expect(processor.isCancelled('job-c')).toBe(false);
  });
});

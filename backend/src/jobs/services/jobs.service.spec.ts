import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateJobDto } from '../dto/create-job.dto';
import { JobStatus } from '../models/job-status.enum';
import { Job } from '../models/job.model';
import { UrlStatus } from '../models/url-status.enum';
import { QueueProcessor } from '../queue/queue.processor';
import { JobRepository } from '../repository/job.repository';
import { JobsService } from './jobs.service';

describe('JobsService', () => {
  let service: JobsService;
  let jobRepository: JobRepository;
  let queueProcessor: QueueProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
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
        {
          provide: QueueProcessor,
          useValue: {
            process: jest.fn().mockResolvedValue(undefined),
            cancel: jest.fn(),
            isCancelled: jest.fn().mockReturnValue(false),
          },
        },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    jobRepository = module.get<JobRepository>(JobRepository);
    queueProcessor = module.get<QueueProcessor>(QueueProcessor);
  });

  describe('createJob', () => {
    it('should create a job with a unique id and correct URLs', () => {
      const dto: CreateJobDto = { urls: ['https://example.com', 'https://google.com'] };
      const job = service.createJob(dto);

      expect(job.id).toBeDefined();
      expect(job.id).toHaveLength(36);
      expect(job.status).toBe(JobStatus.PENDING);
      expect(job.urls).toHaveLength(2);
      expect(job.urls[0].url).toBe('https://example.com');
      expect(job.urls[0].status).toBe(UrlStatus.PENDING);
      expect(job.urls[1].url).toBe('https://google.com');
      expect(jobRepository.save).toHaveBeenCalledWith(job);
    });

    it('should start processing the job immediately', () => {
      const dto: CreateJobDto = { urls: ['https://example.com'] };
      const job = service.createJob(dto);

      expect(queueProcessor.process).toHaveBeenCalledWith(job);
    });
  });

  describe('getAllJobs', () => {
    it('should return all jobs from repository', () => {
      const jobs = [new Job('1', []), new Job('2', [])];
      jest.spyOn(jobRepository, 'findAll').mockReturnValue(jobs);

      const result = service.getAllJobs();
      expect(result).toEqual(jobs);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no jobs exist', () => {
      jest.spyOn(jobRepository, 'findAll').mockReturnValue([]);
      expect(service.getAllJobs()).toEqual([]);
    });
  });

  describe('getJobById', () => {
    it('should return the job when found', () => {
      const job = new Job('123', []);
      jest.spyOn(jobRepository, 'findById').mockReturnValue(job);

      expect(service.getJobById('123')).toBe(job);
    });

    it('should throw NotFoundException when job not found', () => {
      jest.spyOn(jobRepository, 'findById').mockReturnValue(null);

      expect(() => service.getJobById('nonexistent')).toThrow(NotFoundException);
    });
  });

  describe('cancelJob', () => {
    it('should cancel a pending job', () => {
      const job = new Job('123', []);
      jest.spyOn(jobRepository, 'findById').mockReturnValue(job);

      const result = service.cancelJob('123');

      expect(result.status).toBe(JobStatus.CANCELLED);
      expect(queueProcessor.cancel).toHaveBeenCalledWith('123');
      expect(jobRepository.update).toHaveBeenCalledWith(job);
    });

    it('should throw NotFoundException when job not found', () => {
      jest.spyOn(jobRepository, 'findById').mockReturnValue(null);

      expect(() => service.cancelJob('nonexistent')).toThrow(NotFoundException);
    });

    it('should return job as-is if already completed', () => {
      const job = new Job('123', []);
      job.status = JobStatus.COMPLETED;
      jest.spyOn(jobRepository, 'findById').mockReturnValue(job);

      const result = service.cancelJob('123');

      expect(result.status).toBe(JobStatus.COMPLETED);
      expect(queueProcessor.cancel).not.toHaveBeenCalled();
    });

    it('should return job as-is if already cancelled', () => {
      const job = new Job('123', []);
      job.status = JobStatus.CANCELLED;
      jest.spyOn(jobRepository, 'findById').mockReturnValue(job);

      const result = service.cancelJob('123');

      expect(result.status).toBe(JobStatus.CANCELLED);
      expect(queueProcessor.cancel).not.toHaveBeenCalled();
    });

    it('should return job as-is if already failed', () => {
      const job = new Job('123', []);
      job.status = JobStatus.FAILED;
      jest.spyOn(jobRepository, 'findById').mockReturnValue(job);

      const result = service.cancelJob('123');

      expect(result.status).toBe(JobStatus.FAILED);
      expect(queueProcessor.cancel).not.toHaveBeenCalled();
    });
  });
});

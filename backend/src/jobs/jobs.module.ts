import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JobsController } from './controller/jobs.controller';
import { QueueProcessor } from './queue/queue.processor';
import { JobRepository } from './repository/job.repository';
import { JobsService } from './services/jobs.service';

@Module({
  imports: [HttpModule],
  controllers: [JobsController],
  providers: [JobsService, QueueProcessor, JobRepository],
})
export class JobsModule {}

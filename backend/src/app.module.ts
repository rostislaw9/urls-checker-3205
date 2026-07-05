import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [HealthModule, JobsModule],
})
export class AppModule {}

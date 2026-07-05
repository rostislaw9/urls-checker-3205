import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from './job-status.enum';
import { UrlItem } from './url-item.model';

export class Job {
  @ApiProperty({ example: 'ffa54f0c-7f03-4073-a453-411d4d137051' })
  id: string;

  @ApiProperty({ example: '2026-07-05T07:16:13.769Z' })
  createdAt: Date;

  @ApiProperty({ enum: JobStatus, example: JobStatus.IN_PROGRESS })
  status: JobStatus;

  @ApiProperty({ type: () => [UrlItem] })
  urls: UrlItem[];

  constructor(id: string, urls: UrlItem[]) {
    this.id = id;
    this.createdAt = new Date();
    this.status = JobStatus.PENDING;
    this.urls = urls;
  }
}

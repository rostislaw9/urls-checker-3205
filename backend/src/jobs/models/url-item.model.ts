import { ApiProperty } from '@nestjs/swagger';
import { UrlStatus } from './url-status.enum';

export class UrlItem {
  @ApiProperty({ example: 'https://example.com' })
  url: string;

  @ApiProperty({ enum: UrlStatus, example: UrlStatus.SUCCESS })
  status: UrlStatus;

  @ApiProperty({ example: 200, nullable: true })
  httpStatus: number | null;

  @ApiProperty({ example: null, nullable: true })
  error: string | null;

  @ApiProperty({ example: '2026-07-05T07:16:13.770Z', nullable: true })
  startedAt: Date | null;

  @ApiProperty({ example: '2026-07-05T07:16:18.770Z', nullable: true })
  finishedAt: Date | null;

  @ApiProperty({ example: 5000, nullable: true })
  durationMs: number | null;

  constructor(url: string) {
    this.url = url;
    this.status = UrlStatus.PENDING;
    this.httpStatus = null;
    this.error = null;
    this.startedAt = null;
    this.finishedAt = null;
    this.durationMs = null;
  }
}

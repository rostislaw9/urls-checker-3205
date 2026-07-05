import { ApiProperty } from '@nestjs/swagger';

export class CreateJobResponseDto {
  @ApiProperty({ example: 'ffa54f0c-7f03-4073-a453-411d4d137051' })
  jobId: string;

  constructor(jobId: string) {
    this.jobId = jobId;
  }
}

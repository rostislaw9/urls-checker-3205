import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    description: 'List of URLs to check',
    example: ['https://example.com', 'https://google.com'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsUrl({ require_protocol: true }, { each: true })
  urls!: string[];
}

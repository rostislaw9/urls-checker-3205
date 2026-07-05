import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateJobDto } from '../dto/create-job.dto';
import { CreateJobResponseDto } from '../dto/create-job-response.dto';
import { Job } from '../models/job.model';
import { JobsService } from '../services/jobs.service';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new URL checking job' })
  @ApiCreatedResponse({ description: 'Job created successfully', type: CreateJobResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  createJob(@Body() dto: CreateJobDto): CreateJobResponseDto {
    const job = this.jobsService.createJob(dto);
    return new CreateJobResponseDto(job.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiOkResponse({ description: 'List of all jobs', type: [Job] })
  getAllJobs(): Job[] {
    return this.jobsService.getAllJobs();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job by id' })
  @ApiOkResponse({ description: 'Job found', type: Job })
  @ApiNotFoundResponse({ description: 'Job not found' })
  getJob(@Param('id') id: string): Job {
    return this.jobsService.getJobById(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a job by id' })
  @ApiOkResponse({ description: 'Job cancelled', type: Job })
  @ApiNotFoundResponse({ description: 'Job not found' })
  cancelJob(@Param('id') id: string): Job {
    return this.jobsService.cancelJob(id);
  }
}

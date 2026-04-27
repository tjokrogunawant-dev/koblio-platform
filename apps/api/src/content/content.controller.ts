import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { ContentService } from './content.service';
import { ProblemQueryDto } from './dto/problem-query.dto';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Check content service status' })
  getStatus() {
    return this.contentService.getStatus();
  }

  @Get('problems')
  @Public()
  @ApiOperation({ summary: 'List problems with optional filters' })
  async getProblems(@Query() query: ProblemQueryDto) {
    const { grade, strand, topic, difficulty, type, limit, offset } = query;
    const result = await this.contentService.findAll({
      grade,
      strand,
      topic,
      difficulty,
      type,
      limit,
      offset,
    });
    return {
      data: result.data,
      total: result.total,
      limit: limit ?? 20,
      offset: offset ?? 0,
    };
  }

  @Get('problems/grade/:grade')
  @Public()
  @ApiOperation({ summary: 'Get all problems for a specific grade' })
  @ApiParam({ name: 'grade', type: Number, description: 'Grade level (1-6)' })
  async getProblemsByGrade(@Param('grade', ParseIntPipe) grade: number) {
    return this.contentService.findByGrade(grade);
  }

  @Get('problems/:id')
  @Public()
  @ApiOperation({ summary: 'Get a single problem by UUID' })
  @ApiParam({ name: 'id', type: String, description: 'Problem UUID' })
  async getProblemById(@Param('id', ParseUUIDPipe) id: string) {
    return this.contentService.findOne(id);
  }
}

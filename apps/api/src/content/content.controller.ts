import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';

@ApiTags('Content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check content service status' })
  getStatus() {
    return this.contentService.getStatus();
  }
}

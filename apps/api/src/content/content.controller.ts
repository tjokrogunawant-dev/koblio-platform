import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { Public } from '../auth/decorators/public.decorator';

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
}

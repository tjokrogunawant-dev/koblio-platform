import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth() {
    return this.appService.getHealth();
  }
}

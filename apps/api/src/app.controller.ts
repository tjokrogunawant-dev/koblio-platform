import { Controller, Get, HttpCode, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';
import { Public } from './auth/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @Public()
  @HttpCode(200)
  @ApiOperation({ summary: 'Health check — returns db connectivity status' })
  async getHealth(@Res() res: Response) {
    const result = await this.appService.getHealth();
    const statusCode = result.status === 'ok' ? 200 : 503;
    return res.status(statusCode).json(result);
  }
}

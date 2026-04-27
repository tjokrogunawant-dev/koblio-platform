import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Debug')
@Controller('debug-sentry')
export class SentryController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Trigger a test error for Sentry verification' })
  triggerError(): never {
    throw new Error('Sentry test error from Koblio API');
  }
}

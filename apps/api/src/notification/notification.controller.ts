import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('status')
  @Public()
  @ApiOperation({ summary: 'Check notification service status' })
  getStatus() {
    return this.notificationService.getStatus();
  }
}

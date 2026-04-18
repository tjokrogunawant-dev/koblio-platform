import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('status')
  @ApiOperation({ summary: 'Check notification service status' })
  getStatus() {
    return this.notificationService.getStatus();
  }
}

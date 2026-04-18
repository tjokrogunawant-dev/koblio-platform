import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationService {
  getStatus() {
    return { module: 'notification', status: 'operational' };
  }
}

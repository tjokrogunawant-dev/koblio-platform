import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

describe('NotificationController', () => {
  let controller: NotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [NotificationService],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  describe('getStatus', () => {
    it('should return notification module status', () => {
      const result = controller.getStatus();
      expect(result).toEqual({ module: 'notification', status: 'operational' });
    });
  });
});

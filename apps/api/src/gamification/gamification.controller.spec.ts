import { Test, TestingModule } from '@nestjs/testing';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';

describe('GamificationController', () => {
  let controller: GamificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamificationController],
      providers: [GamificationService],
    }).compile();

    controller = module.get<GamificationController>(GamificationController);
  });

  describe('getStatus', () => {
    it('should return gamification module status', () => {
      const result = controller.getStatus();
      expect(result).toEqual({ module: 'gamification', status: 'operational' });
    });
  });
});

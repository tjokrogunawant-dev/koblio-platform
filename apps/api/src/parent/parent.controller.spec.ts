import { Test, TestingModule } from '@nestjs/testing';
import { ParentController } from './parent.controller';
import { ParentService } from './parent.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

const parentUser: AuthenticatedUser = {
  userId: 'auth0|parent1',
  roles: ['parent'],
};

const CHILD_ID = '00000000-0000-0000-0000-000000000002';

describe('ParentController', () => {
  let controller: ParentController;
  let service: { getChildProgress: jest.Mock };

  beforeEach(async () => {
    service = { getChildProgress: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParentController],
      providers: [{ provide: ParentService, useValue: service }],
    }).compile();

    controller = module.get<ParentController>(ParentController);
  });

  describe('getChildProgress', () => {
    it('should call service with parent userId and childId', async () => {
      const expected = {
        totalAttempts: 10,
        correctAttempts: 7,
        accuracyPercent: 70,
        streakCount: 3,
        coins: 50,
        xp: 150,
        level: 2,
        topicBreakdown: [],
      };
      service.getChildProgress.mockResolvedValue(expected);

      const result = await controller.getChildProgress(parentUser, CHILD_ID);

      expect(service.getChildProgress).toHaveBeenCalledWith(
        'auth0|parent1',
        CHILD_ID,
      );
      expect(result).toEqual(expected);
    });
  });
});

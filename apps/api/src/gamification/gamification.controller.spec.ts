import { Test, TestingModule } from '@nestjs/testing';
import { GamificationController } from './gamification.controller';
import { GamificationService } from './gamification.service';

const STUDENT_ID = '00000000-0000-0000-0000-000000000001';
const CLASSROOM_ID = '00000000-0000-0000-0000-000000000030';

describe('GamificationController', () => {
  let controller: GamificationController;
  let service: {
    getStatus: jest.Mock;
    getStudentProfile: jest.Mock;
    getClassLeaderboard: jest.Mock;
    getDailyChallenge: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      getStatus: jest.fn(),
      getStudentProfile: jest.fn(),
      getClassLeaderboard: jest.fn(),
      getDailyChallenge: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamificationController],
      providers: [{ provide: GamificationService, useValue: service }],
    }).compile();

    controller = module.get<GamificationController>(GamificationController);
  });

  describe('getStatus', () => {
    it('should return gamification module status', () => {
      service.getStatus.mockReturnValue({ module: 'gamification', status: 'operational' });
      const result = controller.getStatus();
      expect(result).toEqual({ module: 'gamification', status: 'operational' });
    });
  });

  describe('getMyProfile', () => {
    it('should return student profile', async () => {
      const profile = {
        coins: 50,
        xp: 200,
        level: 2,
        streakCount: 3,
        levelInfo: { level: 2, xpToNextLevel: 50, progressPercent: 67 },
      };
      service.getStudentProfile.mockResolvedValue(profile);

      const result = await controller.getMyProfile({ userId: STUDENT_ID, roles: ['student'] });

      expect(result).toEqual(profile);
      expect(service.getStudentProfile).toHaveBeenCalledWith(STUDENT_ID);
    });
  });

  describe('getLeaderboard', () => {
    it('should return class leaderboard', async () => {
      const leaderboardResult = {
        rank: 2,
        leaderboard: [
          { rank: 1, studentId: 'abc', displayName: 'Alice', weeklyCoins: 100 },
          { rank: 2, studentId: STUDENT_ID, displayName: 'Bob', weeklyCoins: 80 },
        ],
      };
      service.getClassLeaderboard.mockResolvedValue(leaderboardResult);

      const result = await controller.getLeaderboard(
        { userId: STUDENT_ID, roles: ['student'] },
        CLASSROOM_ID,
      );

      expect(result).toEqual(leaderboardResult);
      expect(service.getClassLeaderboard).toHaveBeenCalledWith(CLASSROOM_ID, STUDENT_ID);
    });
  });

  describe('getDailyChallenge', () => {
    it('should return daily challenge for a grade', async () => {
      const problem = {
        id: '00000000-0000-0000-0000-000000000010',
        grade: 2,
        strand: 'Operations',
        topic: 'Addition',
        difficulty: 'EASY',
        type: 'FILL_BLANK',
        content: { question: 'What is 2 + 3?', answer: '5', solution: 'Add them.' },
      };
      service.getDailyChallenge.mockResolvedValue(problem);

      const result = await controller.getDailyChallenge(2);

      expect(result).toEqual(problem);
      expect(service.getDailyChallenge).toHaveBeenCalledWith(2);
    });
  });
});

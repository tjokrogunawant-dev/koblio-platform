import { Test, TestingModule } from '@nestjs/testing';
import { AttemptController } from './attempt.controller';
import { AttemptService } from './attempt.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

const STUDENT_ID = '00000000-0000-0000-0000-000000000001';
const PROBLEM_ID = '00000000-0000-0000-0000-000000000010';

const mockStudentUser: AuthenticatedUser = {
  userId: STUDENT_ID,
  roles: ['student'],
};

describe('AttemptController', () => {
  let controller: AttemptController;
  let service: { [K in keyof AttemptService]: jest.Mock };

  beforeEach(async () => {
    service = {
      submitAnswer: jest.fn(),
      getStudentAttempts: jest.fn(),
      getStudentProblemAttempts: jest.fn(),
      getStudentStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttemptController],
      providers: [{ provide: AttemptService, useValue: service }],
    }).compile();

    controller = module.get<AttemptController>(AttemptController);
  });

  describe('submitAnswer', () => {
    it('should call service.submitAnswer with studentId and dto', async () => {
      const dto = { problemId: PROBLEM_ID, answer: '5', timeSpentMs: 3000 };
      const expected = {
        correct: true,
        correctAnswer: '5',
        solution: 'Add 2 and 3.',
        attemptId: 'attempt-uuid',
      };

      service.submitAnswer.mockResolvedValue(expected);

      const result = await controller.submitAnswer(mockStudentUser, dto);

      expect(service.submitAnswer).toHaveBeenCalledWith(STUDENT_ID, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('getMyAttempts', () => {
    it('should return paginated attempt history with defaults', async () => {
      service.getStudentAttempts.mockResolvedValue({
        data: [],
        total: 0,
      });

      const result = await controller.getMyAttempts(mockStudentUser);

      expect(service.getStudentAttempts).toHaveBeenCalledWith(
        STUDENT_ID,
        undefined,
        undefined,
      );
      expect(result).toEqual({ data: [], total: 0, limit: 20, offset: 0 });
    });

    it('should pass limit and offset through to service', async () => {
      service.getStudentAttempts.mockResolvedValue({ data: [], total: 0 });

      await controller.getMyAttempts(mockStudentUser, 10, 20);

      expect(service.getStudentAttempts).toHaveBeenCalledWith(
        STUDENT_ID,
        10,
        20,
      );
    });
  });

  describe('getMyStats', () => {
    it('should return stats for the current student', async () => {
      const stats = {
        totalAttempts: 10,
        correctAttempts: 8,
        accuracyPercent: 80,
        topicsAttempted: ['Addition'],
      };

      service.getStudentStats.mockResolvedValue(stats);

      const result = await controller.getMyStats(mockStudentUser);

      expect(service.getStudentStats).toHaveBeenCalledWith(STUDENT_ID);
      expect(result).toEqual(stats);
    });
  });

  describe('getMyProblemAttempts', () => {
    it('should return attempts for a specific problem', async () => {
      service.getStudentProblemAttempts.mockResolvedValue([]);

      const result = await controller.getMyProblemAttempts(
        mockStudentUser,
        PROBLEM_ID,
      );

      expect(service.getStudentProblemAttempts).toHaveBeenCalledWith(
        STUDENT_ID,
        PROBLEM_ID,
      );
      expect(result).toEqual([]);
    });
  });
});

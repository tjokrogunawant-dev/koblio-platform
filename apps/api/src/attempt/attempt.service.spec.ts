import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { AttemptService } from './attempt.service';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';
import { BadgeService } from '../badge/badge.service';
import { MasteryService } from '../mastery/mastery.service';
import { SchedulerService } from '../scheduler/scheduler.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

const STUDENT_ID = '00000000-0000-0000-0000-000000000001';
const PROBLEM_ID = '00000000-0000-0000-0000-000000000010';
const ATTEMPT_ID = '00000000-0000-0000-0000-000000000020';

const mockProblem = {
  id: PROBLEM_ID,
  grade: 2,
  strand: 'Operations',
  topic: 'Addition',
  difficulty: 'EASY',
  type: 'FILL_BLANK',
  content: {
    question: 'What is 2 + 3?',
    answer: '5',
    solution: 'Add 2 and 3 together to get 5.',
  },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAttempt = {
  id: ATTEMPT_ID,
  studentId: STUDENT_ID,
  problemId: PROBLEM_ID,
  answer: '5',
  correct: true,
  timeSpentMs: 3000,
  hintUsed: false,
  createdAt: new Date(),
};

const CLASSROOM_ID = '00000000-0000-0000-0000-000000000099';

describe('AttemptService', () => {
  let service: AttemptService;
  let prisma: {
    user: { findUnique: jest.Mock };
    problem: { findUnique: jest.Mock };
    studentProblemAttempt: { create: jest.Mock; findMany: jest.Mock; count: jest.Mock };
    enrollment: { findFirst: jest.Mock };
  };
  let gamification: { awardForAttempt: jest.Mock; updateStreak: jest.Mock };
  let badgeService: { checkAndAwardBadges: jest.Mock };
  let leaderboardService: { getStudentRank: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn().mockResolvedValue({ subscriptionStatus: 'free' }) },
      problem: { findUnique: jest.fn() },
      studentProblemAttempt: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      enrollment: {
        findFirst: jest.fn().mockResolvedValue({ classroomId: CLASSROOM_ID }),
      },
    };

    gamification = {
      awardForAttempt: jest.fn().mockResolvedValue({
        coinsEarned: 3,
        xpEarned: 5,
        newLevel: 1,
        leveledUp: false,
      }),
      updateStreak: jest.fn().mockResolvedValue({ streakCount: 1, streakBonusMultiplier: 1.0 }),
    };

    badgeService = {
      checkAndAwardBadges: jest.fn().mockResolvedValue([]),
    };

    leaderboardService = {
      getStudentRank: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptService,
        { provide: PrismaService, useValue: prisma },
        { provide: GamificationService, useValue: gamification },
        { provide: BadgeService, useValue: badgeService },
        {
          provide: MasteryService,
          useValue: { recordAttempt: jest.fn().mockResolvedValue({ justMastered: false }) },
        },
        {
          provide: SchedulerService,
          useValue: { recordReview: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: LeaderboardService, useValue: leaderboardService },
      ],
    }).compile();

    service = module.get<AttemptService>(AttemptService);
  });

  describe('submitAnswer', () => {
    it('should return correct=true when the answer matches', async () => {
      prisma.problem.findUnique.mockResolvedValue(mockProblem);
      prisma.studentProblemAttempt.create.mockResolvedValue(mockAttempt);

      const result = await service.submitAnswer(STUDENT_ID, {
        problemId: PROBLEM_ID,
        answer: '5',
        timeSpentMs: 3000,
      });

      expect(result.correct).toBe(true);
      expect(result.correctAnswer).toBe('5');
      expect(result.attemptId).toBe(ATTEMPT_ID);
      expect(result.coinsEarned).toBe(3);
      expect(result.xpEarned).toBe(5);
      expect(result.leveledUp).toBe(false);
      expect(prisma.studentProblemAttempt.create).toHaveBeenCalledWith({
        data: {
          studentId: STUDENT_ID,
          problemId: PROBLEM_ID,
          answer: '5',
          correct: true,
          timeSpentMs: 3000,
          hintUsed: false,
        },
      });
    });

    it('should return correct=false when the answer is wrong but still create the attempt', async () => {
      prisma.problem.findUnique.mockResolvedValue(mockProblem);
      const wrongAttempt = { ...mockAttempt, answer: '6', correct: false };
      prisma.studentProblemAttempt.create.mockResolvedValue(wrongAttempt);

      const result = await service.submitAnswer(STUDENT_ID, {
        problemId: PROBLEM_ID,
        answer: '6',
        timeSpentMs: 2000,
      });

      expect(result.correct).toBe(false);
      expect(result.correctAnswer).toBe('5');
      expect(result.attemptId).toBe(ATTEMPT_ID);
      expect(prisma.studentProblemAttempt.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ correct: false }) }),
      );
    });

    it('should perform case-insensitive answer comparison', async () => {
      const trueOrFalseProblem = {
        ...mockProblem,
        type: 'TRUE_FALSE',
        content: {
          question: 'Is 2 + 2 = 4?',
          answer: 'true',
          solution: '2 + 2 equals 4, so the answer is true.',
        },
      };
      prisma.problem.findUnique.mockResolvedValue(trueOrFalseProblem);
      const trueAttempt = { ...mockAttempt, answer: 'TRUE', correct: true };
      prisma.studentProblemAttempt.create.mockResolvedValue(trueAttempt);

      const result = await service.submitAnswer(STUDENT_ID, {
        problemId: PROBLEM_ID,
        answer: 'TRUE',
        timeSpentMs: 1000,
      });

      expect(result.correct).toBe(true);
    });

    it('should throw NotFoundException when the problem does not exist', async () => {
      prisma.problem.findUnique.mockResolvedValue(null);

      await expect(
        service.submitAnswer(STUDENT_ID, {
          problemId: '00000000-0000-0000-0000-000000000099',
          answer: '5',
          timeSpentMs: 1000,
        }),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.studentProblemAttempt.create).not.toHaveBeenCalled();
    });

    it('should record hintUsed=true when the DTO includes it', async () => {
      prisma.problem.findUnique.mockResolvedValue(mockProblem);
      prisma.studentProblemAttempt.create.mockResolvedValue({
        ...mockAttempt,
        hintUsed: true,
      });

      await service.submitAnswer(STUDENT_ID, {
        problemId: PROBLEM_ID,
        answer: '5',
        timeSpentMs: 8000,
        hintUsed: true,
      });

      expect(prisma.studentProblemAttempt.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ hintUsed: true }),
      });
    });

    it('should call gamification and badge services after a correct attempt', async () => {
      prisma.problem.findUnique.mockResolvedValue(mockProblem);
      prisma.studentProblemAttempt.create.mockResolvedValue(mockAttempt);

      await service.submitAnswer(STUDENT_ID, {
        problemId: PROBLEM_ID,
        answer: '5',
        timeSpentMs: 3000,
      });

      expect(gamification.awardForAttempt).toHaveBeenCalledWith(
        STUDENT_ID,
        'EASY',
        true,
        ATTEMPT_ID,
        CLASSROOM_ID,
      );
      expect(gamification.updateStreak).toHaveBeenCalledWith(STUDENT_ID);
      expect(badgeService.checkAndAwardBadges).toHaveBeenCalledWith(
        STUDENT_ID,
        expect.objectContaining({
          correct: true,
          studentStats: expect.objectContaining({ streakCount: 1 }),
        }),
      );
    });

    it('should pass classroomRank=0 to badge service when student is rank 1', async () => {
      prisma.problem.findUnique.mockResolvedValue(mockProblem);
      prisma.studentProblemAttempt.create.mockResolvedValue(mockAttempt);
      leaderboardService.getStudentRank.mockResolvedValue(0); // rank 1 (0-indexed)

      await service.submitAnswer(STUDENT_ID, {
        problemId: PROBLEM_ID,
        answer: '5',
        timeSpentMs: 3000,
      });

      expect(gamification.awardForAttempt).toHaveBeenCalledWith(
        STUDENT_ID,
        'EASY',
        true,
        ATTEMPT_ID,
        CLASSROOM_ID,
      );
      expect(badgeService.checkAndAwardBadges).toHaveBeenCalledWith(
        STUDENT_ID,
        expect.objectContaining({ classroomRank: 0 }),
      );
    });

    it('should not call updateStreak on incorrect attempt', async () => {
      prisma.problem.findUnique.mockResolvedValue(mockProblem);
      const wrongAttempt = { ...mockAttempt, correct: false };
      prisma.studentProblemAttempt.create.mockResolvedValue(wrongAttempt);

      await service.submitAnswer(STUDENT_ID, {
        problemId: PROBLEM_ID,
        answer: '99',
        timeSpentMs: 2000,
      });

      expect(gamification.updateStreak).not.toHaveBeenCalled();
    });

    it('should still return a result if gamification throws', async () => {
      prisma.problem.findUnique.mockResolvedValue(mockProblem);
      prisma.studentProblemAttempt.create.mockResolvedValue(mockAttempt);
      gamification.awardForAttempt.mockRejectedValue(new Error('gamification down'));

      const result = await service.submitAnswer(STUDENT_ID, {
        problemId: PROBLEM_ID,
        answer: '5',
        timeSpentMs: 3000,
      });

      expect(result.correct).toBe(true);
      expect(result.coinsEarned).toBe(0);
      expect(result.xpEarned).toBe(0);
    });

    it('should record attempt when free user is under the daily limit (4 attempts today)', async () => {
      prisma.user.findUnique.mockResolvedValue({ subscriptionStatus: 'free' });
      // First count call = daily limit check (4 < 5, proceed)
      prisma.studentProblemAttempt.count.mockResolvedValueOnce(4);
      prisma.problem.findUnique.mockResolvedValue(mockProblem);
      prisma.studentProblemAttempt.create.mockResolvedValue(mockAttempt);

      const result = await service.submitAnswer(STUDENT_ID, {
        problemId: PROBLEM_ID,
        answer: '5',
        timeSpentMs: 3000,
      });

      expect(result.correct).toBe(true);
      expect(result.attemptId).toBe(ATTEMPT_ID);
      expect(prisma.studentProblemAttempt.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when free user has reached the daily limit (5 attempts today)', async () => {
      prisma.user.findUnique.mockResolvedValue({ subscriptionStatus: 'free' });
      // First count call = daily limit check (5 >= 5, blocked)
      prisma.studentProblemAttempt.count.mockResolvedValueOnce(5);

      await expect(
        service.submitAnswer(STUDENT_ID, {
          problemId: PROBLEM_ID,
          answer: '5',
          timeSpentMs: 3000,
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(prisma.studentProblemAttempt.create).not.toHaveBeenCalled();
    });

    it('should record attempt when premium user has 5 or more attempts today', async () => {
      prisma.user.findUnique.mockResolvedValue({ subscriptionStatus: 'active' });
      // No daily count call expected for premium users
      prisma.problem.findUnique.mockResolvedValue(mockProblem);
      prisma.studentProblemAttempt.create.mockResolvedValue(mockAttempt);

      const result = await service.submitAnswer(STUDENT_ID, {
        problemId: PROBLEM_ID,
        answer: '5',
        timeSpentMs: 3000,
      });

      expect(result.correct).toBe(true);
      expect(result.attemptId).toBe(ATTEMPT_ID);
      expect(prisma.studentProblemAttempt.create).toHaveBeenCalled();
    });
  });

  describe('getStudentStats', () => {
    it('should return correct totals and accuracy', async () => {
      prisma.studentProblemAttempt.count
        .mockResolvedValueOnce(10) // totalAttempts
        .mockResolvedValueOnce(8); // correctAttempts

      prisma.studentProblemAttempt.findMany.mockResolvedValue([
        { problem: { topic: 'Addition' } },
        { problem: { topic: 'Subtraction' } },
        { problem: { topic: 'Addition' } }, // duplicate — should be deduplicated
      ]);

      const result = await service.getStudentStats(STUDENT_ID);

      expect(result.totalAttempts).toBe(10);
      expect(result.correctAttempts).toBe(8);
      expect(result.accuracyPercent).toBe(80);
      expect(result.topicsAttempted).toEqual(['Addition', 'Subtraction']);
    });

    it('should return 0% accuracy when no attempts exist', async () => {
      prisma.studentProblemAttempt.count.mockResolvedValue(0);
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]);

      const result = await service.getStudentStats(STUDENT_ID);

      expect(result.totalAttempts).toBe(0);
      expect(result.correctAttempts).toBe(0);
      expect(result.accuracyPercent).toBe(0);
      expect(result.topicsAttempted).toEqual([]);
    });
  });

  describe('getStudentAttempts', () => {
    it('should return paginated attempts and total', async () => {
      prisma.studentProblemAttempt.findMany.mockResolvedValue([mockAttempt]);
      prisma.studentProblemAttempt.count.mockResolvedValue(1);

      const result = await service.getStudentAttempts(STUDENT_ID, 20, 0);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(prisma.studentProblemAttempt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { studentId: STUDENT_ID },
          orderBy: { createdAt: 'desc' },
          take: 20,
          skip: 0,
        }),
      );
    });
  });

  describe('getStudentProblemAttempts', () => {
    it('should return attempts filtered by student and problem', async () => {
      prisma.studentProblemAttempt.findMany.mockResolvedValue([mockAttempt]);

      const result = await service.getStudentProblemAttempts(STUDENT_ID, PROBLEM_ID);

      expect(result).toHaveLength(1);
      expect(prisma.studentProblemAttempt.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { studentId: STUDENT_ID, problemId: PROBLEM_ID },
        }),
      );
    });
  });
});

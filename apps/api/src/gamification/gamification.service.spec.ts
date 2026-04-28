import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from './gamification.service';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';

const STUDENT_ID = '00000000-0000-0000-0000-000000000001';
const ATTEMPT_ID = '00000000-0000-0000-0000-000000000020';
const PROBLEM_ID = '00000000-0000-0000-0000-000000000010';
const _CLASSROOM_ID = '00000000-0000-0000-0000-000000000030';

describe('GamificationService', () => {
  let service: GamificationService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findUniqueOrThrow: jest.Mock;
      update: jest.Mock;
    };
    pointsLedger: { create: jest.Mock };
    problem: { findMany: jest.Mock };
    $transaction: jest.Mock;
    $queryRaw: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
      pointsLedger: { create: jest.fn() },
      problem: { findMany: jest.fn() },
      $transaction: jest.fn(),
      $queryRaw: jest.fn(),
    };

    // Default $transaction implementation: execute the callback with prisma as tx
    prisma.$transaction.mockImplementation((cb: (tx: typeof prisma) => Promise<unknown>) =>
      cb(prisma),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: LeaderboardService,
          useValue: {
            addScore: jest.fn(),
            getClassroomLeaderboard: jest.fn().mockResolvedValue([]),
            getStudentRank: jest.fn().mockResolvedValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
  });

  // ─── getLevelInfo ────────────────────────────────────────────────────────

  describe('getLevelInfo', () => {
    it('should return level 1 at 0 XP', () => {
      const info = service.getLevelInfo(0);
      expect(info.level).toBe(1);
      expect(info.xpToNextLevel).toBe(100);
      expect(info.progressPercent).toBe(0);
    });

    it('should return level 1 at 50 XP with 50% progress', () => {
      const info = service.getLevelInfo(50);
      expect(info.level).toBe(1);
      expect(info.progressPercent).toBe(50);
      expect(info.xpToNextLevel).toBe(50);
    });

    it('should return level 2 at exactly 100 XP', () => {
      const info = service.getLevelInfo(100);
      expect(info.level).toBe(2);
      expect(info.xpToNextLevel).toBe(150); // 250 - 100
    });

    it('should return level 3 at 250 XP', () => {
      const info = service.getLevelInfo(250);
      expect(info.level).toBe(3);
    });

    it('should return level 10 at 5000 XP with 100% progress', () => {
      const info = service.getLevelInfo(5000);
      expect(info.level).toBe(10);
      expect(info.progressPercent).toBe(100);
      expect(info.xpToNextLevel).toBe(0);
    });

    it('should cap at level 10 for XP beyond 5000', () => {
      const info = service.getLevelInfo(9999);
      expect(info.level).toBe(10);
      expect(info.progressPercent).toBe(100);
    });
  });

  // ─── awardForAttempt ──────────────────────────────────────────────────────

  describe('awardForAttempt', () => {
    const setupUserUpdate = (currentXp: number) => {
      prisma.user.update.mockResolvedValue({
        xp: currentXp,
        level: 1,
        coins: 10,
      });
      prisma.pointsLedger.create.mockResolvedValue({});
    };

    it('should award +3 coins and +5 XP for EASY correct answer', async () => {
      setupUserUpdate(5);

      const result = await service.awardForAttempt(STUDENT_ID, 'EASY', true, ATTEMPT_ID);

      expect(result.coinsEarned).toBe(3);
      expect(result.xpEarned).toBe(5);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { coins: { increment: 3 }, xp: { increment: 5 } },
        }),
      );
      expect(prisma.pointsLedger.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ amount: 3, reason: 'correct_answer_easy' }),
        }),
      );
    });

    it('should award +5 coins and +10 XP for MEDIUM correct answer', async () => {
      setupUserUpdate(10);

      const result = await service.awardForAttempt(STUDENT_ID, 'MEDIUM', true, ATTEMPT_ID);

      expect(result.coinsEarned).toBe(5);
      expect(result.xpEarned).toBe(10);
    });

    it('should award +10 coins and +20 XP for HARD correct answer', async () => {
      setupUserUpdate(20);

      const result = await service.awardForAttempt(STUDENT_ID, 'HARD', true, ATTEMPT_ID);

      expect(result.coinsEarned).toBe(10);
      expect(result.xpEarned).toBe(20);
    });

    it('should award +0 coins and +1 XP for wrong answer', async () => {
      prisma.user.update.mockResolvedValue({ xp: 1, level: 1, coins: 0 });
      prisma.pointsLedger.create.mockResolvedValue({});

      const result = await service.awardForAttempt(STUDENT_ID, 'EASY', false, ATTEMPT_ID);

      expect(result.coinsEarned).toBe(0);
      expect(result.xpEarned).toBe(1);
      // Should not write to points ledger for wrong answers
      expect(prisma.pointsLedger.create).not.toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { coins: { increment: 0 }, xp: { increment: 1 } },
        }),
      );
    });

    it('should detect level-up when XP crosses a threshold', async () => {
      // Student currently has 98 XP, earns 5 more (EASY correct) → 103 XP → level 2
      prisma.user.update
        .mockResolvedValueOnce({ xp: 103, level: 1, coins: 3 }) // $transaction update
        .mockResolvedValueOnce({ xp: 103, level: 2, coins: 3 }); // level update
      prisma.pointsLedger.create.mockResolvedValue({});

      const result = await service.awardForAttempt(STUDENT_ID, 'EASY', true, ATTEMPT_ID);

      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBe(2);
    });

    it('should not detect level-up when XP stays in same level', async () => {
      prisma.user.update.mockResolvedValue({ xp: 50, level: 1, coins: 3 });
      prisma.pointsLedger.create.mockResolvedValue({});

      const result = await service.awardForAttempt(STUDENT_ID, 'EASY', true, ATTEMPT_ID);

      expect(result.leveledUp).toBe(false);
    });
  });

  // ─── updateStreak ─────────────────────────────────────────────────────────

  describe('updateStreak', () => {
    const makeLastActive = (daysAgo: number): Date => {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      d.setHours(0, 0, 0, 0);
      return d;
    };

    it('should set streak to 1 when student has never been active', async () => {
      prisma.user.findUnique.mockResolvedValue({ streakCount: 0, lastActiveDate: null });
      prisma.user.update.mockResolvedValue({});

      const result = await service.updateStreak(STUDENT_ID);

      expect(result.streakCount).toBe(1);
      expect(result.streakBonusMultiplier).toBe(1.0);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ streakCount: 1 }),
        }),
      );
    });

    it('should increment streak when last active was yesterday', async () => {
      prisma.user.findUnique.mockResolvedValue({
        streakCount: 3,
        lastActiveDate: makeLastActive(1),
      });
      prisma.user.update.mockResolvedValue({});

      const result = await service.updateStreak(STUDENT_ID);

      expect(result.streakCount).toBe(4);
      expect(result.streakBonusMultiplier).toBe(1.0);
    });

    it('should not change streak when already active today', async () => {
      prisma.user.findUnique.mockResolvedValue({
        streakCount: 5,
        lastActiveDate: makeLastActive(0),
      });

      const result = await service.updateStreak(STUDENT_ID);

      expect(result.streakCount).toBe(5);
      // No DB update should happen
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should reset streak to 1 when there is a gap day', async () => {
      prisma.user.findUnique.mockResolvedValue({
        streakCount: 10,
        lastActiveDate: makeLastActive(3), // 3 days ago — gap
      });
      prisma.user.update.mockResolvedValue({});

      const result = await service.updateStreak(STUDENT_ID);

      expect(result.streakCount).toBe(1);
    });

    it('should return 1.5x multiplier when streak reaches 7', async () => {
      prisma.user.findUnique.mockResolvedValue({
        streakCount: 6,
        lastActiveDate: makeLastActive(1),
      });
      prisma.user.update.mockResolvedValue({});

      const result = await service.updateStreak(STUDENT_ID);

      expect(result.streakCount).toBe(7);
      expect(result.streakBonusMultiplier).toBe(1.5);
    });

    it('should return 1.5x multiplier when streak is already >= 7 and active today', async () => {
      prisma.user.findUnique.mockResolvedValue({
        streakCount: 8,
        lastActiveDate: makeLastActive(0),
      });

      const result = await service.updateStreak(STUDENT_ID);

      expect(result.streakCount).toBe(8);
      expect(result.streakBonusMultiplier).toBe(1.5);
    });
  });

  // ─── getDailyChallenge ────────────────────────────────────────────────────

  describe('getDailyChallenge', () => {
    const mockProblems = [
      {
        id: PROBLEM_ID,
        grade: 2,
        strand: 'Operations',
        topic: 'Addition',
        difficulty: 'EASY',
        type: 'FILL_BLANK',
        content: { question: 'What is 2 + 3?', answer: '5', solution: 'Add them.' },
      },
      {
        id: '00000000-0000-0000-0000-000000000011',
        grade: 2,
        strand: 'Operations',
        topic: 'Subtraction',
        difficulty: 'MEDIUM',
        type: 'FILL_BLANK',
        content: { question: 'What is 5 - 2?', answer: '3', solution: 'Subtract.' },
      },
    ];

    it('should return a problem for a valid grade', async () => {
      prisma.problem.findMany.mockResolvedValue(mockProblems);

      const result = await service.getDailyChallenge(2);

      expect(result).not.toBeNull();
      expect(result!.grade).toBe(2);
      expect(prisma.problem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { grade: 2 } }),
      );
    });

    it('should return null when no problems exist for the grade', async () => {
      prisma.problem.findMany.mockResolvedValue([]);

      const result = await service.getDailyChallenge(6);

      expect(result).toBeNull();
    });

    it('should return a deterministic problem based on the day', async () => {
      prisma.problem.findMany.mockResolvedValue(mockProblems);

      const result1 = await service.getDailyChallenge(2);
      prisma.problem.findMany.mockResolvedValue(mockProblems);
      const result2 = await service.getDailyChallenge(2);

      // Same day → same problem
      expect(result1!.id).toBe(result2!.id);
    });

    it('should index into problems array using day-based modulus', async () => {
      // With 2 problems, the index cycles between 0 and 1
      prisma.problem.findMany.mockResolvedValue(mockProblems);

      const dayIndex = Math.floor(Date.now() / 86400000);
      const expectedIndex = dayIndex % mockProblems.length;

      const result = await service.getDailyChallenge(2);

      expect(result!.id).toBe(mockProblems[expectedIndex].id);
    });
  });
});

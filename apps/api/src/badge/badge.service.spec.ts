import { Test, TestingModule } from '@nestjs/testing';
import { BadgeType } from '@prisma/client';
import { BadgeService, BadgeAwardContext } from './badge.service';
import { PrismaService } from '../prisma/prisma.service';

const STUDENT_ID = '00000000-0000-0000-0000-000000000001';

/** Helper — builds a minimal context with sensible defaults. */
function makeContext(overrides: Partial<BadgeAwardContext> = {}): BadgeAwardContext {
  return {
    correct: true,
    timeSpentMs: 15_000,
    problem: { grade: 2, topic: 'Addition', strand: 'Operations' },
    studentStats: { totalAttempts: 1, correctTotal: 1, streakCount: 0 },
    ...overrides,
  };
}

describe('BadgeService', () => {
  let service: BadgeService;
  let prisma: {
    badge: {
      findMany: jest.Mock;
      createMany: jest.Mock;
    };
    studentProblemAttempt: {
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      badge: {
        findMany: jest.fn().mockResolvedValue([]),
        createMany: jest.fn().mockResolvedValue({ count: 0 }),
      },
      studentProblemAttempt: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgeService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<BadgeService>(BadgeService);
  });

  // ── Helpers ───────────────────────────────────────────────────────────────

  function mockNoBadgesYet() {
    prisma.badge.findMany.mockResolvedValue([]);
  }

  function mockAlreadyHas(...types: BadgeType[]) {
    prisma.badge.findMany.mockResolvedValue(types.map((type) => ({ type })));
  }

  // ── first_correct ─────────────────────────────────────────────────────────

  describe('FIRST_CORRECT', () => {
    it('awards first_correct on a correct answer when student has no badges', async () => {
      mockNoBadgesYet();
      // No queries needed for this badge beyond the existing-badges check
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]); // last-10 check (perfect_10 path)

      const slugs = await service.checkAndAwardBadges(
        STUDENT_ID,
        makeContext({ correct: true }),
      );

      expect(slugs).toContain('first_correct');
      expect(prisma.badge.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({ type: BadgeType.FIRST_CORRECT }),
          ]),
        }),
      );
    });

    it('does NOT award first_correct when correct=false', async () => {
      mockNoBadgesYet();
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]);

      const slugs = await service.checkAndAwardBadges(
        STUDENT_ID,
        makeContext({ correct: false }),
      );

      expect(slugs).not.toContain('first_correct');
    });
  });

  // ── speed_demon ───────────────────────────────────────────────────────────

  describe('SPEED_DEMON', () => {
    it('awards speed_demon for a correct answer under 10 seconds', async () => {
      mockNoBadgesYet();
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]);

      const slugs = await service.checkAndAwardBadges(
        STUDENT_ID,
        makeContext({ correct: true, timeSpentMs: 9_999 }),
      );

      expect(slugs).toContain('speed_demon');
    });

    it('does NOT award speed_demon when answer is wrong even if fast', async () => {
      mockNoBadgesYet();
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]);

      const slugs = await service.checkAndAwardBadges(
        STUDENT_ID,
        makeContext({ correct: false, timeSpentMs: 1_000 }),
      );

      expect(slugs).not.toContain('speed_demon');
    });

    it('does NOT award speed_demon for exactly 10 seconds (boundary)', async () => {
      mockNoBadgesYet();
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]);

      const slugs = await service.checkAndAwardBadges(
        STUDENT_ID,
        makeContext({ correct: true, timeSpentMs: 10_000 }),
      );

      expect(slugs).not.toContain('speed_demon');
    });
  });

  // ── problems_100 ──────────────────────────────────────────────────────────

  describe('PROBLEMS_100', () => {
    it('awards problems_100 when totalAttempts reaches 100', async () => {
      mockNoBadgesYet();
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]);

      const slugs = await service.checkAndAwardBadges(
        STUDENT_ID,
        makeContext({ studentStats: { totalAttempts: 100, correctTotal: 50, streakCount: 0 } }),
      );

      expect(slugs).toContain('problems_100');
    });

    it('does NOT award problems_100 when totalAttempts is 99', async () => {
      mockNoBadgesYet();
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]);

      const slugs = await service.checkAndAwardBadges(
        STUDENT_ID,
        makeContext({ studentStats: { totalAttempts: 99, correctTotal: 40, streakCount: 0 } }),
      );

      expect(slugs).not.toContain('problems_100');
    });
  });

  // ── streak_7 ──────────────────────────────────────────────────────────────

  describe('STREAK_7', () => {
    it('awards streak_7 when streakCount >= 7', async () => {
      mockNoBadgesYet();
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]);

      const slugs = await service.checkAndAwardBadges(
        STUDENT_ID,
        makeContext({ studentStats: { totalAttempts: 10, correctTotal: 5, streakCount: 7 } }),
      );

      expect(slugs).toContain('streak_7');
    });

    it('does NOT award streak_7 when streakCount is 6', async () => {
      mockNoBadgesYet();
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]);

      const slugs = await service.checkAndAwardBadges(
        STUDENT_ID,
        makeContext({ studentStats: { totalAttempts: 10, correctTotal: 5, streakCount: 6 } }),
      );

      expect(slugs).not.toContain('streak_7');
    });
  });

  // ── idempotency ───────────────────────────────────────────────────────────

  describe('idempotency', () => {
    it('does NOT award a badge the student already has', async () => {
      mockAlreadyHas(
        BadgeType.FIRST_CORRECT,
        BadgeType.SPEED_DEMON,
        BadgeType.STREAK_7,
      );
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]);

      const slugs = await service.checkAndAwardBadges(
        STUDENT_ID,
        makeContext({
          correct: true,
          timeSpentMs: 5_000,
          studentStats: { totalAttempts: 10, correctTotal: 5, streakCount: 10 },
        }),
      );

      expect(slugs).not.toContain('first_correct');
      expect(slugs).not.toContain('speed_demon');
      expect(slugs).not.toContain('streak_7');
    });

    it('calls createMany with skipDuplicates:true', async () => {
      mockNoBadgesYet();
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]);

      await service.checkAndAwardBadges(
        STUDENT_ID,
        makeContext({ correct: true }),
      );

      expect(prisma.badge.createMany).toHaveBeenCalledWith(
        expect.objectContaining({ skipDuplicates: true }),
      );
    });

    it('does not call createMany when no new badges are earned', async () => {
      // Student already has first_correct; answer is wrong so no other simple badges apply
      mockAlreadyHas(BadgeType.FIRST_CORRECT);
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]);

      const slugs = await service.checkAndAwardBadges(
        STUDENT_ID,
        makeContext({ correct: false, timeSpentMs: 30_000 }),
      );

      expect(slugs).toHaveLength(0);
      expect(prisma.badge.createMany).not.toHaveBeenCalled();
    });
  });

  // ── getStudentBadges ──────────────────────────────────────────────────────

  describe('getStudentBadges', () => {
    it('returns badges enriched with metadata', async () => {
      const awardedAt = new Date('2026-04-27T00:00:00.000Z');
      prisma.badge.findMany.mockResolvedValue([
        { type: BadgeType.FIRST_CORRECT, awardedAt, id: 'uuid1', studentId: STUDENT_ID },
      ]);

      const result = await service.getStudentBadges(STUDENT_ID);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        type: BadgeType.FIRST_CORRECT,
        slug: 'first_correct',
        name: 'First Steps',
        description: 'Get your first correct answer',
        awardedAt,
      });
    });

    it('returns an empty array when the student has no badges', async () => {
      prisma.badge.findMany.mockResolvedValue([]);

      const result = await service.getStudentBadges(STUDENT_ID);

      expect(result).toEqual([]);
    });
  });
});

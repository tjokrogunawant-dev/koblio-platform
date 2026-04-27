import { Test, TestingModule } from '@nestjs/testing';
import { MoodService } from './mood.service';
import { MoodState } from './mood.types';
import { PrismaService } from '../prisma/prisma.service';

const makePrisma = (attempts: { correct: boolean; timeSpentMs: number }[]) => ({
  studentProblemAttempt: {
    findMany: jest.fn().mockResolvedValue(attempts),
  },
});

describe('MoodService', () => {
  let service: MoodService;
  let prisma: ReturnType<typeof makePrisma>;

  async function build(attempts: { correct: boolean; timeSpentMs: number }[]) {
    prisma = makePrisma(attempts);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoodService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<MoodService>(MoodService);
  }

  describe('detectMood', () => {
    it('returns BORED when all answers are correct and very fast', async () => {
      // accuracy=1.0 (>=0.8), avgTimeMs=2000 (<5000) → BORED
      const attempts = Array.from({ length: 5 }, () => ({ correct: true, timeSpentMs: 2000 }));
      await build(attempts);
      expect(await service.detectMood('student-1')).toBe(MoodState.BORED);
    });

    it('returns CONFUSED when all answers are wrong and slow', async () => {
      // accuracy=0.0 (<0.4), avgTimeMs=15000 (>=10000) → CONFUSED
      const attempts = Array.from({ length: 5 }, () => ({ correct: false, timeSpentMs: 15000 }));
      await build(attempts);
      expect(await service.detectMood('student-1')).toBe(MoodState.CONFUSED);
    });

    it('returns FRUSTRATED when all answers are wrong and fast (guessing)', async () => {
      // accuracy=0.0 (<0.4), avgTimeMs=3000 (<10000) → FRUSTRATED
      const attempts = Array.from({ length: 5 }, () => ({ correct: false, timeSpentMs: 3000 }));
      await build(attempts);
      expect(await service.detectMood('student-1')).toBe(MoodState.FRUSTRATED);
    });

    it('returns FLOW when accuracy is good and pace is normal', async () => {
      // 4/5 correct = accuracy=0.8 (>=0.7), avgTimeMs=12000 (in [5000,30000])
      // BORED check: accuracy=0.8 >=0.8 BUT avgTimeMs=12000 is NOT <5000 → not BORED
      // FLOW check: accuracy=0.8 >=0.7 AND avgTimeMs in [5000,30000] → FLOW
      const attempts = [
        { correct: true, timeSpentMs: 12000 },
        { correct: true, timeSpentMs: 12000 },
        { correct: true, timeSpentMs: 12000 },
        { correct: true, timeSpentMs: 12000 },
        { correct: false, timeSpentMs: 12000 },
      ];
      await build(attempts);
      expect(await service.detectMood('student-1')).toBe(MoodState.FLOW);
    });

    it('returns FLOW when there is no attempt history (empty window)', async () => {
      await build([]);
      expect(await service.detectMood('student-1')).toBe(MoodState.FLOW);
    });

    it('returns FLOW via default fall-through (mid accuracy, slow pace)', async () => {
      // accuracy=0.6 (<0.7 so not BORED, >=0.4 so not FRUSTRATED/CONFUSED) → FLOW default
      await build([
        { correct: true, timeSpentMs: 40000 },
        { correct: true, timeSpentMs: 40000 },
        { correct: true, timeSpentMs: 40000 },
        { correct: false, timeSpentMs: 40000 },
        { correct: false, timeSpentMs: 40000 },
      ]);
      expect(await service.detectMood('student-1')).toBe(MoodState.FLOW);
    });

    it('returns FLOW when accuracy is exactly 0.7 and avgTimeMs is exactly 5000 (lower bound)', async () => {
      // 3.5/5 is not possible with integers — simulate with 7 correct in a 10-attempt
      // window limited to 5: use 5 attempts where accuracy rounds to >=0.7
      // With 5 attempts: need floor(5 * 0.7) = 3.5 → can't get exactly 0.7 with 5
      // Use: 7 out of 10 but window is 5 → closest is 4/5=0.8 or 3/5=0.6
      // Task says "accuracy=0.7, avgTime=5000 → FLOW"
      // Simulate with a mock that returns exactly calculated values:
      // Use 10 attempts to get exactly 7/10 = 0.7, but window is 5.
      // The spec says "Exactly at boundary (accuracy=0.7, avgTime=5000) → FLOW"
      // We achieve this by providing 10 attempts where 7 are correct, all at 5000ms,
      // but prisma is mocked to return exactly 5 attempts (per WINDOW_SIZE).
      // Simplest: mock returns [true,true,true,false,false] + adjust times for 0.6 — that won't work.
      // Instead, override prisma mock to return 10 records where 7 are correct:
      prisma = makePrisma([
        { correct: true, timeSpentMs: 5000 },
        { correct: true, timeSpentMs: 5000 },
        { correct: true, timeSpentMs: 5000 },
        { correct: true, timeSpentMs: 5000 },
        { correct: true, timeSpentMs: 5000 },
        { correct: true, timeSpentMs: 5000 },
        { correct: true, timeSpentMs: 5000 },
        { correct: false, timeSpentMs: 5000 },
        { correct: false, timeSpentMs: 5000 },
        { correct: false, timeSpentMs: 5000 },
      ]);
      // Prisma is mocked to return ALL of these (no take: 5 enforced in mock)
      // so accuracy = 7/10 = 0.7 and avgTimeMs = 5000 → FLOW condition >=0.7 and in [5000,30000]
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MoodService,
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      service = module.get<MoodService>(MoodService);
      expect(await service.detectMood('student-1')).toBe(MoodState.FLOW);
    });
  });

  describe('getWeights', () => {
    beforeEach(async () => {
      await build([]);
    });

    it('returns correct weights for FLOW', () => {
      const w = service.getWeights(MoodState.FLOW);
      expect(w).toEqual({ fsrsWeight: 0.5, bktWeight: 0.3, noveltyWeight: 0.2, difficultyOffset: 0 });
    });

    it('returns correct weights for FRUSTRATED', () => {
      const w = service.getWeights(MoodState.FRUSTRATED);
      expect(w).toEqual({ fsrsWeight: 0.3, bktWeight: 0.5, noveltyWeight: 0.2, difficultyOffset: -1 });
    });

    it('returns correct weights for CONFUSED', () => {
      const w = service.getWeights(MoodState.CONFUSED);
      expect(w).toEqual({ fsrsWeight: 0.2, bktWeight: 0.6, noveltyWeight: 0.2, difficultyOffset: -2 });
    });

    it('returns correct weights for BORED', () => {
      const w = service.getWeights(MoodState.BORED);
      expect(w).toEqual({ fsrsWeight: 0.4, bktWeight: 0.2, noveltyWeight: 0.4, difficultyOffset: 1 });
    });
  });

  describe('getMoodWeights', () => {
    it('returns mood and weights together', async () => {
      const attempts = Array.from({ length: 5 }, () => ({ correct: false, timeSpentMs: 3000 }));
      await build(attempts);
      const result = await service.getMoodWeights('student-1');
      expect(result.mood).toBe(MoodState.FRUSTRATED);
      expect(result.weights).toEqual({ fsrsWeight: 0.3, bktWeight: 0.5, noveltyWeight: 0.2, difficultyOffset: -1 });
    });
  });
});

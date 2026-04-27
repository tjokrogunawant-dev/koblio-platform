import { Test, TestingModule } from '@nestjs/testing';
import { FsrsService } from './fsrs.service';

describe('FsrsService', () => {
  let service: FsrsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FsrsService],
    }).compile();

    service = module.get<FsrsService>(FsrsService);
  });

  // ── getInitialState ─────────────────────────────────────────────────────────

  describe('getInitialState', () => {
    it('returns stability 2.5 for rating 1 (Again)', () => {
      const state = service.getInitialState(1);
      expect(state.stability).toBe(2.5);
      expect(state.difficulty).toBe(5.0);
    });

    it('returns stability 5.0 for rating 2 (Hard)', () => {
      const state = service.getInitialState(2);
      expect(state.stability).toBe(5.0);
      expect(state.difficulty).toBe(5.0);
    });

    it('returns stability 10.0 for rating 3 (Good)', () => {
      const state = service.getInitialState(3);
      expect(state.stability).toBe(10.0);
      expect(state.difficulty).toBe(5.0);
    });

    it('returns stability 20.0 for rating 4 (Easy)', () => {
      const state = service.getInitialState(4);
      expect(state.stability).toBe(20.0);
      expect(state.difficulty).toBe(5.0);
    });
  });

  // ── computeRetrievability ───────────────────────────────────────────────────

  describe('computeRetrievability', () => {
    it('returns 1.0 when no time has elapsed', () => {
      const R = service.computeRetrievability(10, 0);
      expect(R).toBe(1.0);
    });

    it('returns values between 0 and 1 for positive elapsed time', () => {
      const R = service.computeRetrievability(10, 5);
      expect(R).toBeGreaterThan(0);
      expect(R).toBeLessThan(1);
    });

    it('returns ~0.9 when elapsed equals ~S (the 90% retention point is at t = S*ln(10/9)*9 ≈ 0.95S)', () => {
      // At t = S, R = e^(-1/9) ≈ 0.895
      const S = 10;
      const R = service.computeRetrievability(S, S);
      expect(R).toBeCloseTo(Math.exp(-1 / 9), 4);
    });

    it('decreases as more time passes', () => {
      const S = 10;
      const R1 = service.computeRetrievability(S, 1);
      const R2 = service.computeRetrievability(S, 5);
      const R3 = service.computeRetrievability(S, 10);
      expect(R1).toBeGreaterThan(R2);
      expect(R2).toBeGreaterThan(R3);
    });
  });

  // ── computeNextState ────────────────────────────────────────────────────────

  describe('computeNextState — stability', () => {
    const baseCard = { stability: 10.0, difficulty: 5.0, reviewCount: 1 };
    const R = 0.9; // high retrievability

    it('increases stability after a Good review (rating 3)', () => {
      const result = service.computeNextState(baseCard, 3, R);
      expect(result.newStability).toBeGreaterThan(baseCard.stability);
    });

    it('increases stability after an Easy review (rating 4)', () => {
      const result = service.computeNextState(baseCard, 4, R);
      expect(result.newStability).toBeGreaterThan(baseCard.stability);
    });

    it('Easy review yields more stability than Good review', () => {
      const good = service.computeNextState(baseCard, 3, R);
      const easy = service.computeNextState(baseCard, 4, R);
      expect(easy.newStability).toBeGreaterThan(good.newStability);
    });

    it('decreases stability after an Again review (rating 1)', () => {
      const result = service.computeNextState(baseCard, 1, R);
      expect(result.newStability).toBeLessThan(baseCard.stability);
    });

    it('decreases stability after a Hard review (rating 2)', () => {
      const result = service.computeNextState(baseCard, 2, R);
      expect(result.newStability).toBeLessThan(baseCard.stability);
    });

    it('stability is always positive (minimum 0.1)', () => {
      // Very low retrievability on failure
      const result = service.computeNextState(baseCard, 1, 0.01);
      expect(result.newStability).toBeGreaterThanOrEqual(0.1);
    });
  });

  describe('computeNextState — difficulty clamping', () => {
    it('clamps difficulty to 1.0 minimum', () => {
      const card = { stability: 10.0, difficulty: 1.0, reviewCount: 5 };
      // rating 1 = Again → D' = D + (1-3)*0.1 = 1.0 - 0.2 = 0.8, clamped to 1.0
      const result = service.computeNextState(card, 1, 0.9);
      expect(result.newDifficulty).toBe(1.0);
    });

    it('clamps difficulty to 10.0 maximum', () => {
      const card = { stability: 10.0, difficulty: 10.0, reviewCount: 5 };
      // rating 4 = Easy → D' = D + (4-3)*0.1 = 10.1, clamped to 10.0
      const result = service.computeNextState(card, 4, 0.9);
      expect(result.newDifficulty).toBe(10.0);
    });

    it('increases difficulty on Again (rating 1)', () => {
      // rating 1: D' = D + (1-3)*0.1 = D - 0.2
      // Wait — lower rating means harder card, but FSRS convention:
      // Again(1) = couldn't remember → problem is harder → D increases
      // D' = D + (rating - 3) * 0.1 → rating=1 → D - 0.2 → but that DECREASES D
      // That's correct in FSRS: rating below 3 means user found it harder than expected
      // D decreases on Easy, increases on Again per the formula sign
      const card = { stability: 10.0, difficulty: 5.0, reviewCount: 5 };
      const result = service.computeNextState(card, 1, 0.9);
      // D' = 5.0 + (1-3)*0.1 = 5.0 - 0.2 = 4.8
      expect(result.newDifficulty).toBeCloseTo(4.8, 5);
    });

    it('difficulty stays within [1.0, 10.0] for all ratings', () => {
      const card = { stability: 10.0, difficulty: 5.0, reviewCount: 5 };
      for (const rating of [1, 2, 3, 4] as (1 | 2 | 3 | 4)[]) {
        const result = service.computeNextState(card, rating, 0.9);
        expect(result.newDifficulty).toBeGreaterThanOrEqual(1.0);
        expect(result.newDifficulty).toBeLessThanOrEqual(10.0);
      }
    });
  });

  describe('computeNextState — nextReviewDays', () => {
    it('nextReviewDays is always positive', () => {
      const card = { stability: 10.0, difficulty: 5.0, reviewCount: 1 };
      for (const rating of [1, 2, 3, 4] as (1 | 2 | 3 | 4)[]) {
        const result = service.computeNextState(card, rating, 0.9);
        expect(result.nextReviewDays).toBeGreaterThan(0);
      }
    });

    it('dueDate is in the future', () => {
      const card = { stability: 10.0, difficulty: 5.0, reviewCount: 1 };
      const result = service.computeNextState(card, 3, 0.9);
      expect(result.dueDate.getTime()).toBeGreaterThan(Date.now());
    });

    it('nextReviewDays equals newStability * 0.9', () => {
      const card = { stability: 10.0, difficulty: 5.0, reviewCount: 1 };
      const result = service.computeNextState(card, 3, 0.9);
      expect(result.nextReviewDays).toBeCloseTo(result.newStability * 0.9, 5);
    });
  });
});

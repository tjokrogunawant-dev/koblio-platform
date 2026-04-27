import { Test, TestingModule } from '@nestjs/testing';
import { BktService, DEFAULT_BKT_PARAMS } from './bkt.service';

describe('BktService', () => {
  let service: BktService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BktService],
    }).compile();

    service = module.get<BktService>(BktService);
  });

  describe('updateMastery', () => {
    it('should increase mastery after a correct answer', () => {
      const initial = DEFAULT_BKT_PARAMS.pL0; // 0.1
      const updated = service.updateMastery(initial, true);
      expect(updated).toBeGreaterThan(initial);
    });

    it('should decrease mastery after an incorrect answer', () => {
      const initial = 0.5;
      const updated = service.updateMastery(initial, false);
      expect(updated).toBeLessThan(initial);
    });

    it('should never exceed 1.0', () => {
      // Simulate many correct answers starting from high mastery
      let mastery = 0.99;
      for (let i = 0; i < 20; i++) {
        mastery = service.updateMastery(mastery, true);
        expect(mastery).toBeLessThanOrEqual(1.0);
      }
    });

    it('should never go below 0.0', () => {
      // Simulate many incorrect answers starting from very low mastery
      let mastery = 0.01;
      for (let i = 0; i < 20; i++) {
        mastery = service.updateMastery(mastery, false);
        expect(mastery).toBeGreaterThanOrEqual(0.0);
      }
    });

    it('two correct answers in a row should increase mastery more than one correct answer', () => {
      const initial = DEFAULT_BKT_PARAMS.pL0;
      const afterOne = service.updateMastery(initial, true);
      const afterTwo = service.updateMastery(afterOne, true);
      expect(afterTwo).toBeGreaterThan(afterOne);
    });

    it('should apply the exact BKT formula for a correct answer', () => {
      // Manual calculation with default params:
      // P(L0) = 0.1, P(S) = 0.1, P(G) = 0.25, P(T) = 0.1
      // P(Ln | correct) = 0.1 * 0.9 / (0.1 * 0.9 + 0.9 * 0.25) = 0.09 / (0.09 + 0.225) = 0.09 / 0.315
      // pLGivenObs ≈ 0.28571
      // pLAfterTransit = 0.28571 + (1 - 0.28571) * 0.1 = 0.28571 + 0.071429 ≈ 0.35714
      const result = service.updateMastery(0.1, true, DEFAULT_BKT_PARAMS);
      expect(result).toBeCloseTo(0.35714, 4);
    });

    it('should apply the exact BKT formula for an incorrect answer', () => {
      // P(L0) = 0.1, P(S) = 0.1, P(G) = 0.25, P(T) = 0.1
      // P(Ln | incorrect) = 0.1 * 0.1 / (0.1 * 0.1 + 0.9 * 0.75) = 0.01 / (0.01 + 0.675) = 0.01 / 0.685
      // pLGivenObs ≈ 0.014599
      // pLAfterTransit = 0.014599 + (1 - 0.014599) * 0.1 ≈ 0.014599 + 0.09854 ≈ 0.11314
      const result = service.updateMastery(0.1, false, DEFAULT_BKT_PARAMS);
      expect(result).toBeCloseTo(0.11314, 4);
    });

    it('should respect custom BKT parameters', () => {
      const customParams = { pL0: 0.2, pT: 0.2, pG: 0.3, pS: 0.05 };
      const initial = 0.3;
      const withDefault = service.updateMastery(initial, true, DEFAULT_BKT_PARAMS);
      const withCustom = service.updateMastery(initial, true, customParams);
      // Both should increase from 0.3, but values should differ
      expect(withCustom).toBeGreaterThan(initial);
      expect(withCustom).not.toBeCloseTo(withDefault, 4);
    });
  });

  describe('isMastered', () => {
    it('should return true at exactly 0.95', () => {
      expect(service.isMastered(0.95)).toBe(true);
    });

    it('should return false at 0.94', () => {
      expect(service.isMastered(0.94)).toBe(false);
    });

    it('should return true above 0.95', () => {
      expect(service.isMastered(0.99)).toBe(true);
      expect(service.isMastered(1.0)).toBe(true);
    });

    it('should return false below 0.95', () => {
      expect(service.isMastered(0.0)).toBe(false);
      expect(service.isMastered(0.5)).toBe(false);
      expect(service.isMastered(0.9499)).toBe(false);
    });
  });
});

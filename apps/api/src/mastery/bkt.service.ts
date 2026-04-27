import { Injectable } from '@nestjs/common';

export interface BktParams {
  pL0: number; // prior = 0.1
  pT: number;  // transit = 0.1
  pG: number;  // guess = 0.25
  pS: number;  // slip = 0.1
}

export const DEFAULT_BKT_PARAMS: BktParams = {
  pL0: 0.1,
  pT: 0.1,
  pG: 0.25,
  pS: 0.1,
};

const MASTERY_THRESHOLD = 0.95;

@Injectable()
export class BktService {
  /**
   * Update mastery probability given an observation (correct/incorrect) and
   * apply the transit step.
   *
   * Formula (correct):
   *   P(Ln | correct) = P(Ln-1) * (1 - P(S)) / [P(Ln-1) * (1-P(S)) + (1-P(Ln-1)) * P(G)]
   *
   * Formula (incorrect):
   *   P(Ln | incorrect) = P(Ln-1) * P(S) / [P(Ln-1) * P(S) + (1-P(Ln-1)) * (1-P(G))]
   *
   * After observation, apply transit:
   *   P(Ln+1) = P(Ln|obs) + (1 - P(Ln|obs)) * P(T)
   *
   * @param currentMastery  Current P(L) — the prior for this attempt
   * @param correct         Whether the student answered correctly
   * @param params          BKT parameters (defaults to DEFAULT_BKT_PARAMS)
   * @returns New mastery probability clamped to [0.0, 1.0]
   */
  updateMastery(
    currentMastery: number,
    correct: boolean,
    params: BktParams = DEFAULT_BKT_PARAMS,
  ): number {
    const { pT, pG, pS } = params;

    let pLGivenObs: number;

    if (correct) {
      // P(Ln | correct) = P(Ln-1) * (1 - P(S)) / [P(Ln-1) * (1-P(S)) + (1-P(Ln-1)) * P(G)]
      const numerator = currentMastery * (1 - pS);
      const denominator = numerator + (1 - currentMastery) * pG;
      pLGivenObs = denominator === 0 ? currentMastery : numerator / denominator;
    } else {
      // P(Ln | incorrect) = P(Ln-1) * P(S) / [P(Ln-1) * P(S) + (1-P(Ln-1)) * (1-P(G))]
      const numerator = currentMastery * pS;
      const denominator = numerator + (1 - currentMastery) * (1 - pG);
      pLGivenObs = denominator === 0 ? currentMastery : numerator / denominator;
    }

    // Apply transit: P(Ln+1) = P(Ln|obs) + (1 - P(Ln|obs)) * P(T)
    const pLAfterTransit = pLGivenObs + (1 - pLGivenObs) * pT;

    // Clamp to [0.0, 1.0]
    return Math.min(1.0, Math.max(0.0, pLAfterTransit));
  }

  /**
   * Returns true if mastery probability meets or exceeds the mastery threshold (0.95).
   */
  isMastered(mastery: number): boolean {
    return mastery >= MASTERY_THRESHOLD;
  }
}

import { Injectable } from '@nestjs/common';

export interface CardState {
  stability: number; // days until retention drops to 90%
  difficulty: number; // 1–10
  reviewCount: number;
}

export interface ReviewResult {
  newStability: number;
  newDifficulty: number;
  nextReviewDays: number; // interval until next review
  dueDate: Date;
}

// FSRS-4.5 initial stability constants by rating
const INITIAL_STABILITY: Record<1 | 2 | 3 | 4, number> = {
  1: 2.5,
  2: 5.0,
  3: 10.0,
  4: 20.0,
};

// Easy penalty coefficient for post-review stability formula
const STABILITY_PENALTY: Record<3 | 4, number> = {
  4: 0.0,  // Easy — no penalty
  3: -0.15, // Good — small penalty
};

@Injectable()
export class FsrsService {
  /**
   * Compute retrievability R = e^(-t / (9 * S))
   * where t = days since last review, S = stability in days.
   */
  computeRetrievability(stability: number, daysSinceLastReview: number): number {
    if (daysSinceLastReview <= 0) return 1.0;
    return Math.exp(-daysSinceLastReview / (9 * stability));
  }

  /**
   * Return the initial stability and difficulty for a brand-new card
   * based on the first rating.
   */
  getInitialState(rating: 1 | 2 | 3 | 4): { stability: number; difficulty: number } {
    return {
      stability: INITIAL_STABILITY[rating],
      difficulty: 5.0, // default difficulty for new cards
    };
  }

  /**
   * Compute the next card state after a review.
   *
   * Stability update (FSRS-4.5):
   *   Correct (rating 3 or 4):
   *     S' = S * exp(0.9 * (11 - D) * (R^0.5 - 1) + penalty)
   *     penalty = 0 for Easy (4), -0.15 for Good (3)
   *
   *   Failed (rating 1 or 2):
   *     S' = S * exp(-0.3 * R)
   *
   * Difficulty update:
   *   D' = clamp(D + (3 - rating) * 0.1, 1.0, 10.0)
   *   Again(1) → D+0.2 (harder), Easy(4) → D-0.1 (easier)
   *
   * Next review interval (90% retention target):
   *   I = S * 9/10  (derived from R_target = 0.9 = e^(-I/(9S)))
   */
  computeNextState(
    card: CardState,
    rating: 1 | 2 | 3 | 4,
    retrievability: number,
  ): ReviewResult {
    const { stability, difficulty } = card;

    // Clamp R to valid range
    const R = Math.max(0.0, Math.min(1.0, retrievability));

    let newStability: number;

    if (rating >= 3) {
      // Correct review: Good (3) or Easy (4)
      const penalty = STABILITY_PENALTY[rating as 3 | 4];
      newStability =
        stability *
        Math.exp(0.9 * (11 - difficulty) * (Math.pow(R, 0.5) - 1) + penalty);
    } else {
      // Failed review: Again (1) or Hard (2)
      newStability = stability * Math.exp(-0.3 * R);
    }

    // Stability must be at least 0.1 days (avoid scheduling in the past)
    newStability = Math.max(0.1, newStability);

    // Difficulty update: D' = clamp(D + (3 - rating) * 0.1, 1.0, 10.0)
    const rawDifficulty = difficulty + (3 - rating) * 0.1;
    const newDifficulty = Math.max(1.0, Math.min(10.0, rawDifficulty));

    // Next review interval for 90% retention target
    // I = S * ln(0.9) / ln(R_target), with R_target = 0.9 → simplifies to S * 9/10
    const nextReviewDays = newStability * 0.9;

    const dueDate = new Date();
    dueDate.setTime(dueDate.getTime() + nextReviewDays * 24 * 60 * 60 * 1000);

    return { newStability, newDifficulty, nextReviewDays, dueDate };
  }
}

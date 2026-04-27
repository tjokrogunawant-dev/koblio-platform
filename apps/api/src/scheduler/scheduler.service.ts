import { Injectable, Logger, Optional } from '@nestjs/common';
import { Problem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FsrsService } from './fsrs.service';
import { MoodService } from '../mood/mood.service';
import { MoodState, MoodWeights } from '../mood/mood.types';

/** Default weights used when MoodService is unavailable (FLOW state). */
const DEFAULT_FLOW_WEIGHTS: MoodWeights = {
  fsrsWeight: 0.5,
  bktWeight: 0.3,
  noveltyWeight: 0.2,
  difficultyOffset: 0,
};

/** BKT prior probability of latent knowledge — matches DEFAULT_BKT_PARAMS.pL0 */
const BKT_PRIOR = 0.1;

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly fsrs: FsrsService,
    @Optional() private readonly moodService: MoodService | null,
  ) {}

  /**
   * Get the next N due cards for a student (dueDate <= now, ordered by dueDate ASC).
   * Returns the CardState records (with embedded problem via include if needed).
   */
  async getDueCards(studentId: string, limit: number) {
    const now = new Date();
    return this.prisma.cardState.findMany({
      where: {
        studentId,
        dueDate: { lte: now },
      },
      orderBy: { dueDate: 'asc' },
      take: limit,
      include: { problem: true },
    });
  }

  /**
   * Get N problems the student hasn't seen yet for a given grade/topic.
   * "New" = no CardState record exists for this student+problem pair.
   */
  async getNewCards(
    studentId: string,
    grade: number,
    topic: string,
    limit: number,
  ): Promise<Problem[]> {
    // Find problems in this grade+topic that the student has already touched
    const seenStates = await this.prisma.cardState.findMany({
      where: { studentId },
      select: { problemId: true },
    });
    const seenIds = seenStates.map((s) => s.problemId);

    return this.prisma.problem.findMany({
      where: {
        grade,
        topic,
        ...(seenIds.length > 0 ? { id: { notIn: seenIds } } : {}),
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Record a review outcome for a student+problem pair, updating FSRS state.
   * Uses upsert so first-time reviews create the card state.
   */
  async recordReview(
    studentId: string,
    problemId: string,
    rating: 1 | 2 | 3 | 4,
  ): Promise<void> {
    const now = new Date();

    // Fetch existing card state (if any)
    const existing = await this.prisma.cardState.findUnique({
      where: { studentId_problemId: { studentId, problemId } },
    });

    let newStability: number;
    let newDifficulty: number;
    let dueDate: Date;

    if (!existing || existing.reviewCount === 0) {
      // First review — use FSRS initial state
      const initial = this.fsrs.getInitialState(rating);
      newStability = initial.stability;
      newDifficulty = initial.difficulty;
      // Next interval = S * 0.9
      const intervalDays = newStability * 0.9;
      dueDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    } else {
      // Subsequent review — compute retrievability then update state
      const daysSinceLast = existing.lastReview
        ? (now.getTime() - existing.lastReview.getTime()) / (1000 * 60 * 60 * 24)
        : 0;

      const retrievability = this.fsrs.computeRetrievability(
        existing.stability,
        daysSinceLast,
      );

      const result = this.fsrs.computeNextState(
        {
          stability: existing.stability,
          difficulty: existing.difficulty,
          reviewCount: existing.reviewCount,
        },
        rating,
        retrievability,
      );

      newStability = result.newStability;
      newDifficulty = result.newDifficulty;
      dueDate = result.dueDate;
    }

    await this.prisma.cardState.upsert({
      where: { studentId_problemId: { studentId, problemId } },
      create: {
        studentId,
        problemId,
        stability: newStability,
        difficulty: newDifficulty,
        dueDate,
        lastReview: now,
        reviewCount: 1,
      },
      update: {
        stability: newStability,
        difficulty: newDifficulty,
        dueDate,
        lastReview: now,
        reviewCount: { increment: 1 },
      },
    });

    this.logger.debug(
      `FSRS review: student=${studentId} problem=${problemId} rating=${rating} ` +
        `newStability=${newStability.toFixed(2)} dueDate=${dueDate.toISOString()}`,
    );
  }

  /**
   * Get the next recommended problem for a student.
   * Priority: due cards first, then new cards.
   * @deprecated Use getNextProblemBlended — this method ignores mood weights and BKT scoring.
   */
  async getNextProblem(
    studentId: string,
    grade: number,
    topic: string,
  ): Promise<Problem | null> {
    // 1. Check for a due card
    const dueCards = await this.getDueCards(studentId, 1);
    if (dueCards.length > 0) {
      return dueCards[0].problem;
    }

    // 2. Fall back to a new card
    const newCards = await this.getNewCards(studentId, grade, topic, 1);
    if (newCards.length > 0) {
      return newCards[0];
    }

    return null;
  }

  /**
   * Blended scheduler (Strategy C+D).
   *
   * Combines three signals to rank candidate problems and select the best next one:
   *  - FSRS urgency: how overdue is the card?
   *  - BKT novelty: how unmastered is the skill?
   *  - Novelty bonus: has the student never seen this problem before?
   *
   * Weights are mood-gated via MoodService.getMoodWeights().
   * Difficulty is filtered based on difficultyOffset from the mood weights.
   *
   * Falls back to no difficulty filter if the filtered query returns 0 candidates.
   */
  async getNextProblemBlended(
    studentId: string,
    grade: number,
    topic: string,
  ): Promise<Problem | null> {
    // Step 1: Get mood weights (fallback to FLOW defaults if MoodService unavailable)
    let weights: MoodWeights = DEFAULT_FLOW_WEIGHTS;
    let mood: MoodState = MoodState.FLOW;

    if (this.moodService) {
      try {
        const result = await this.moodService.getMoodWeights(studentId);
        weights = result.weights;
        mood = result.mood;
      } catch (err) {
        this.logger.warn(
          `MoodService.getMoodWeights failed, using FLOW defaults: ${String(err)}`,
        );
      }
    }

    this.logger.debug(
      `Blended scheduler: student=${studentId} grade=${grade} topic=${topic} ` +
        `mood=${mood} difficultyOffset=${weights.difficultyOffset}`,
    );

    // Step 2: Determine difficulty filter from offset
    const difficultyIn = this.getDifficultyFilter(weights.difficultyOffset);

    // Step 3: Query candidate problems (up to 50), optionally filtered by difficulty
    let candidates = await this.queryCandidates(grade, topic, difficultyIn, 50);

    // If no candidates after filtering, relax the filter and try without it
    if (candidates.length === 0 && difficultyIn !== null) {
      this.logger.debug(
        `No candidates after difficulty filter [${difficultyIn.join(',')}] — relaxing filter`,
      );
      candidates = await this.queryCandidates(grade, topic, null, 50);
    }

    if (candidates.length === 0) {
      return null;
    }

    const candidateIds = candidates.map((p) => p.id);

    // Step 4: Batch-fetch all CardStates and SkillMasteries (avoid N+1)
    const [cardStateRows, masteryRows] = await Promise.all([
      this.prisma.cardState.findMany({
        where: { studentId, problemId: { in: candidateIds } },
      }),
      this.prisma.skillMastery.findMany({
        where: {
          studentId,
          // Skill key format: "grade{N}:{strand}:{topic}"
          // We fetch all skills for this student and filter by topic below.
          // In practice one skill covers all problems in the same grade+topic.
        },
      }),
    ]);

    // Build O(1) lookup maps
    const cardStateByProblemId = new Map(cardStateRows.map((cs) => [cs.problemId, cs]));
    const masteryBySkill = new Map(masteryRows.map((sm) => [sm.skill, sm.masteryProb]));

    const now = Date.now();

    // Step 5: Score each candidate
    let bestProblem: Problem | null = null;
    let bestScore = -Infinity;

    for (const problem of candidates) {
      const cardState = cardStateByProblemId.get(problem.id) ?? null;

      // FSRS urgency
      let fsrsUrgency = 0;
      if (cardState) {
        const daysSinceDue =
          (now - cardState.dueDate.getTime()) / (1000 * 60 * 60 * 24);
        const stability = Math.max(cardState.stability, 1);
        fsrsUrgency = Math.max(0, daysSinceDue / stability);
      }

      // BKT novelty — skill key: "grade{N}:{strand}:{topic}"
      const skillKey = `grade${problem.grade}:${problem.strand}:${problem.topic}`;
      const masteryProb = masteryBySkill.get(skillKey) ?? BKT_PRIOR;
      const bktNovelty = 1.0 - masteryProb;

      // Novelty bonus — unseen problem
      const novelty = cardState === null ? 1.0 : 0.0;

      // Blended score
      const score =
        weights.fsrsWeight * fsrsUrgency +
        weights.bktWeight * bktNovelty +
        weights.noveltyWeight * novelty;

      this.logger.debug(
        `  problem=${problem.id} fsrsUrgency=${fsrsUrgency.toFixed(3)} ` +
          `bktNovelty=${bktNovelty.toFixed(3)} novelty=${novelty} score=${score.toFixed(3)}`,
      );

      if (score > bestScore) {
        bestScore = score;
        bestProblem = problem;
      }
    }

    if (bestProblem) {
      this.logger.debug(
        `Blended scheduler selected: problem=${bestProblem.id} score=${bestScore.toFixed(3)}`,
      );
    }

    return bestProblem;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Map difficultyOffset to an allowlist of Difficulty enum values.
   * Returns null for "no filter" (offset == 0).
   */
  private getDifficultyFilter(offset: number): string[] | null {
    if (offset <= -2) return ['EASY'];
    if (offset === -1) return ['EASY', 'MEDIUM'];
    if (offset >= 1) return ['MEDIUM', 'HARD'];
    return null; // offset == 0 → no filter
  }

  /**
   * Query candidate problems for a grade+topic, with optional difficulty filter.
   */
  private async queryCandidates(
    grade: number,
    topic: string,
    difficultyIn: string[] | null,
    limit: number,
  ): Promise<Problem[]> {
    return this.prisma.problem.findMany({
      where: {
        grade,
        topic,
        ...(difficultyIn
          ? { difficulty: { in: difficultyIn as import('@prisma/client').Difficulty[] } }
          : {}),
      },
      take: limit,
      orderBy: { createdAt: 'asc' },
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { SkillMastery } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BktService, DEFAULT_BKT_PARAMS } from './bkt.service';

@Injectable()
export class MasteryService {
  private readonly logger = new Logger(MasteryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly bktService: BktService,
  ) {}

  /**
   * Record an attempt for a skill and update BKT mastery.
   * Uses upsert — creates the record on first attempt for this skill.
   *
   * @param studentId  UUID of the student
   * @param skill      Skill key e.g. "grade2:fractions:addition"
   * @param correct    Whether the attempt was correct
   * @returns Updated masteryProb, mastered flag, and justMastered flag
   */
  async recordAttempt(
    studentId: string,
    skill: string,
    correct: boolean,
  ): Promise<{ masteryProb: number; mastered: boolean; justMastered: boolean }> {
    // Fetch existing record (if any) to get current mastery
    const existing = await this.prisma.skillMastery.findUnique({
      where: { studentId_skill: { studentId, skill } },
    });

    const currentMastery = existing?.masteryProb ?? DEFAULT_BKT_PARAMS.pL0;
    const wasAlreadyMastered = existing?.mastered ?? false;

    // Compute new mastery via BKT
    const newMastery = this.bktService.updateMastery(currentMastery, correct);
    const nowMastered = wasAlreadyMastered || this.bktService.isMastered(newMastery);
    const justMastered = !wasAlreadyMastered && nowMastered;

    // Upsert the skill mastery record
    const updated = await this.prisma.skillMastery.upsert({
      where: { studentId_skill: { studentId, skill } },
      create: {
        studentId,
        skill,
        masteryProb: newMastery,
        attemptCount: 1,
        mastered: nowMastered,
        lastUpdated: new Date(),
      },
      update: {
        masteryProb: newMastery,
        attemptCount: { increment: 1 },
        mastered: nowMastered,
        lastUpdated: new Date(),
      },
    });

    this.logger.log(
      `BKT update: student=${studentId} skill=${skill} correct=${correct} ` +
        `mastery=${currentMastery.toFixed(4)}->${updated.masteryProb.toFixed(4)} ` +
        `mastered=${updated.mastered} justMastered=${justMastered}`,
    );

    return {
      masteryProb: updated.masteryProb,
      mastered: updated.mastered,
      justMastered,
    };
  }

  /**
   * Get all skill masteries for a student.
   */
  async getStudentMasteries(studentId: string): Promise<SkillMastery[]> {
    return this.prisma.skillMastery.findMany({
      where: { studentId },
      orderBy: { skill: 'asc' },
    });
  }

  /**
   * Get the current mastery probability for a specific skill.
   * Returns P(L0) = 0.1 if no record exists yet.
   */
  async getSkillMastery(studentId: string, skill: string): Promise<number> {
    const record = await this.prisma.skillMastery.findUnique({
      where: { studentId_skill: { studentId, skill } },
    });
    return record?.masteryProb ?? DEFAULT_BKT_PARAMS.pL0;
  }

  /**
   * Get all skills that are NOT yet mastered for a student.
   * Returns skill keys for skills with at least one attempt but mastered=false.
   */
  async getUnmasteredSkills(studentId: string): Promise<string[]> {
    const records = await this.prisma.skillMastery.findMany({
      where: { studentId, mastered: false },
      select: { skill: true },
      orderBy: { masteryProb: 'desc' },
    });
    return records.map((r) => r.skill);
  }
}

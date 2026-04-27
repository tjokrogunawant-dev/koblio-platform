import { Injectable, NotFoundException } from '@nestjs/common';
import { Problem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SchedulerService } from '../scheduler/scheduler.service';

export interface ProblemOption {
  label: string;
  text: string;
}

export interface ProblemDto {
  id: string;
  grade: number;
  strand: string;
  topic: string;
  difficulty: string;
  type: string;
  questionText: string;
  options?: ProblemOption[];
  correctAnswer: string;
  solution: string;
  hints?: string[];
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export function mapProblem(row: Problem): ProblemDto {
  const content = row.content as {
    question: string;
    answer: string;
    options?: string[] | null;
    hints?: string[];
    solution?: string;
  };

  return {
    id: row.id,
    grade: row.grade,
    strand: row.strand,
    topic: row.topic,
    difficulty: row.difficulty,
    type: row.type,
    questionText: content.question,
    correctAnswer: content.answer,
    solution: content.solution ?? '',
    hints: content.hints,
    options: Array.isArray(content.options)
      ? content.options.map((text, i) => ({
          label: OPTION_LABELS[i] ?? String(i + 1),
          text,
        }))
      : undefined,
  };
}

@Injectable()
export class ContentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly schedulerService: SchedulerService,
  ) {}

  getStatus() {
    return { module: 'content', status: 'operational' };
  }

  async findAll(filters: {
    grade?: number;
    strand?: string;
    topic?: string;
    difficulty?: string;
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: ProblemDto[]; total: number }> {
    const { grade, strand, topic, difficulty, type, limit = 20, offset = 0 } =
      filters;

    const where: Record<string, unknown> = {};
    if (grade !== undefined) where['grade'] = grade;
    if (strand !== undefined) where['strand'] = strand;
    if (topic !== undefined) where['topic'] = topic;
    if (difficulty !== undefined) where['difficulty'] = difficulty;
    if (type !== undefined) where['type'] = type;

    const [rows, total] = await Promise.all([
      this.prisma.problem.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.problem.count({ where }),
    ]);

    return { data: rows.map(mapProblem), total };
  }

  async findOne(id: string): Promise<ProblemDto> {
    const problem = await this.prisma.problem.findUnique({ where: { id } });
    if (!problem) {
      throw new NotFoundException(`Problem with id "${id}" not found`);
    }
    return mapProblem(problem);
  }

  async findByGrade(grade: number): Promise<ProblemDto[]> {
    const rows = await this.prisma.problem.findMany({
      where: { grade },
      orderBy: [{ strand: 'asc' }, { topic: 'asc' }],
    });
    return rows.map(mapProblem);
  }

  async createProblem(dto: {
    grade: number;
    strand: string;
    topic: string;
    difficulty: string;
    type: string;
    content: Record<string, unknown>;
  }): Promise<ProblemDto> {
    const row = await this.prisma.problem.create({
      data: {
        grade: dto.grade,
        strand: dto.strand,
        topic: dto.topic,
        difficulty: dto.difficulty as import('@prisma/client').Difficulty,
        type: dto.type as import('@prisma/client').ProblemType,
        content: dto.content,
      },
    });
    return mapProblem(row);
  }

  /**
   * Return the next adaptive problem for a student using the blended scheduler
   * (Strategy C+D: FSRS urgency + BKT novelty + mood-gated weights).
   */
  async getNextAdaptiveProblem(
    studentId: string,
    grade: number,
    topic: string,
  ): Promise<ProblemDto | null> {
    const problem = await this.schedulerService.getNextProblemBlended(
      studentId,
      grade,
      topic,
    );
    if (!problem) return null;
    return mapProblem(problem);
  }

  async updateProblem(
    id: string,
    dto: {
      grade?: number;
      strand?: string;
      topic?: string;
      difficulty?: string;
      type?: string;
      content?: Record<string, unknown>;
    },
  ): Promise<ProblemDto> {
    const existing = await this.prisma.problem.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Problem with id "${id}" not found`);
    }

    const data: Record<string, unknown> = {};
    if (dto.grade !== undefined) data['grade'] = dto.grade;
    if (dto.strand !== undefined) data['strand'] = dto.strand;
    if (dto.topic !== undefined) data['topic'] = dto.topic;
    if (dto.difficulty !== undefined) data['difficulty'] = dto.difficulty;
    if (dto.type !== undefined) data['type'] = dto.type;
    if (dto.content !== undefined) data['content'] = dto.content;

    const row = await this.prisma.problem.update({ where: { id }, data });
    return mapProblem(row);
  }
}

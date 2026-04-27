import { Injectable, NotFoundException } from '@nestjs/common';
import { Problem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

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
  }): Promise<{ data: Problem[]; total: number }> {
    const { grade, strand, topic, difficulty, type, limit = 20, offset = 0 } =
      filters;

    const where: Record<string, unknown> = {};
    if (grade !== undefined) where['grade'] = grade;
    if (strand !== undefined) where['strand'] = strand;
    if (topic !== undefined) where['topic'] = topic;
    if (difficulty !== undefined) where['difficulty'] = difficulty;
    if (type !== undefined) where['type'] = type;

    const [data, total] = await Promise.all([
      this.prisma.problem.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.problem.count({ where }),
    ]);

    return { data, total };
  }

  async findOne(id: string): Promise<Problem> {
    const problem = await this.prisma.problem.findUnique({ where: { id } });
    if (!problem) {
      throw new NotFoundException(`Problem with id "${id}" not found`);
    }
    return problem;
  }

  async findByGrade(grade: number): Promise<Problem[]> {
    return this.prisma.problem.findMany({
      where: { grade },
      orderBy: [{ strand: 'asc' }, { topic: 'asc' }],
    });
  }
}

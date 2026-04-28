import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ContentService } from './content.service';
import { PrismaService } from '../prisma/prisma.service';

const mockProblem = {
  id: 'a0000000-0000-0000-0000-000000000001',
  curriculum: 'US_COMMON_CORE',
  grade: 2,
  strand: 'Number and Operations',
  topic: 'Addition',
  difficulty: 'EASY',
  type: 'MCQ',
  content: {
    question: 'What is 1 + 1?',
    options: ['1', '2', '3', '4'],
    answer: '2',
    hints: [],
    solution: '1 + 1 = 2',
    image_url: null,
  },
  createdAt: new Date('2026-04-27T00:00:00.000Z'),
  updatedAt: new Date('2026-04-27T00:00:00.000Z'),
};

const mockPrismaService = {
  problem: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
};

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<ContentService>(ContentService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('returns paginated result with no filters applied', async () => {
      mockPrismaService.problem.findMany.mockResolvedValue([mockProblem]);
      mockPrismaService.problem.count.mockResolvedValue(1);

      const result = await service.findAll({});

      expect(result).toEqual({ data: [mockProblem], total: 1 });
      expect(mockPrismaService.problem.findMany).toHaveBeenCalledWith({
        where: {},
        take: 20,
        skip: 0,
        orderBy: { createdAt: 'asc' },
      });
      expect(mockPrismaService.problem.count).toHaveBeenCalledWith({
        where: {},
      });
    });

    it('applies grade filter when provided', async () => {
      mockPrismaService.problem.findMany.mockResolvedValue([mockProblem]);
      mockPrismaService.problem.count.mockResolvedValue(1);

      await service.findAll({ grade: 2 });

      expect(mockPrismaService.problem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { grade: 2 } }),
      );
      expect(mockPrismaService.problem.count).toHaveBeenCalledWith({
        where: { grade: 2 },
      });
    });

    it('applies multiple filters when provided', async () => {
      mockPrismaService.problem.findMany.mockResolvedValue([mockProblem]);
      mockPrismaService.problem.count.mockResolvedValue(1);

      await service.findAll({
        grade: 3,
        strand: 'Number and Operations',
        difficulty: 'MEDIUM',
        limit: 10,
        offset: 5,
      });

      expect(mockPrismaService.problem.findMany).toHaveBeenCalledWith({
        where: {
          grade: 3,
          strand: 'Number and Operations',
          difficulty: 'MEDIUM',
        },
        take: 10,
        skip: 5,
        orderBy: { createdAt: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('returns the problem when found by id', async () => {
      mockPrismaService.problem.findUnique.mockResolvedValue(mockProblem);

      const result = await service.findOne(mockProblem.id);

      expect(result).toEqual(mockProblem);
      expect(mockPrismaService.problem.findUnique).toHaveBeenCalledWith({
        where: { id: mockProblem.id },
      });
    });

    it('throws NotFoundException when id does not exist', async () => {
      mockPrismaService.problem.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByGrade', () => {
    it('returns all problems for the given grade', async () => {
      mockPrismaService.problem.findMany.mockResolvedValue([mockProblem]);

      const result = await service.findByGrade(2);

      expect(result).toEqual([mockProblem]);
      expect(mockPrismaService.problem.findMany).toHaveBeenCalledWith({
        where: { grade: 2 },
        orderBy: [{ strand: 'asc' }, { topic: 'asc' }],
      });
    });
  });
});

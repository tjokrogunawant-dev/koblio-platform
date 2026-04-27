import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ParentService } from './parent.service';
import { PrismaService } from '../prisma/prisma.service';

const PARENT_AUTH0 = 'auth0|parent1';
const CHILD_ID = '00000000-0000-0000-0000-000000000002';

const mockParent = {
  id: '00000000-0000-0000-0000-000000000001',
  auth0Id: PARENT_AUTH0,
  displayName: 'Alice Parent',
};

const mockChild = {
  id: CHILD_ID,
  displayName: 'Bobby Zhang',
  coins: 100,
  xp: 250,
  level: 3,
  streakCount: 5,
};

describe('ParentService', () => {
  let service: ParentService;
  let prisma: {
    user: { findUnique: jest.Mock };
    parentChildLink: { findUnique: jest.Mock };
    studentProblemAttempt: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      parentChildLink: { findUnique: jest.fn() },
      studentProblemAttempt: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<ParentService>(ParentService);
  });

  describe('getChildProgress', () => {
    it('should return child progress for a linked parent', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(mockParent) // parent lookup
        .mockResolvedValueOnce(mockChild); // child lookup
      prisma.parentChildLink.findUnique.mockResolvedValue({ id: 'link-1' });
      prisma.studentProblemAttempt.findMany.mockResolvedValue([
        {
          correct: true,
          problem: { topic: 'addition' },
        },
        {
          correct: false,
          problem: { topic: 'addition' },
        },
        {
          correct: true,
          problem: { topic: 'subtraction' },
        },
      ]);

      const result = await service.getChildProgress(PARENT_AUTH0, CHILD_ID);

      expect(result.totalAttempts).toBe(3);
      expect(result.correctAttempts).toBe(2);
      expect(result.accuracyPercent).toBe(67);
      expect(result.streakCount).toBe(5);
      expect(result.coins).toBe(100);
      expect(result.xp).toBe(250);
      expect(result.level).toBe(3);
      expect(result.topicBreakdown).toHaveLength(2);
    });

    it('should return zero stats for a child with no attempts', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(mockParent)
        .mockResolvedValueOnce(mockChild);
      prisma.parentChildLink.findUnique.mockResolvedValue({ id: 'link-1' });
      prisma.studentProblemAttempt.findMany.mockResolvedValue([]);

      const result = await service.getChildProgress(PARENT_AUTH0, CHILD_ID);

      expect(result.totalAttempts).toBe(0);
      expect(result.accuracyPercent).toBe(0);
      expect(result.topicBreakdown).toHaveLength(0);
    });

    it('should throw NotFoundException if parent not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.getChildProgress('auth0|unknown', CHILD_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if parent-child link missing', async () => {
      prisma.user.findUnique.mockResolvedValue(mockParent);
      prisma.parentChildLink.findUnique.mockResolvedValue(null);

      await expect(
        service.getChildProgress(PARENT_AUTH0, CHILD_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if child account not found', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(mockParent) // parent found
        .mockResolvedValueOnce(null); // child not found
      prisma.parentChildLink.findUnique.mockResolvedValue({ id: 'link-1' });

      await expect(
        service.getChildProgress(PARENT_AUTH0, CHILD_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });
});

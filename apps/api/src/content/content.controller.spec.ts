import { Test, TestingModule } from '@nestjs/testing';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { PrismaService } from '../prisma/prisma.service';
import { SchedulerService } from '../scheduler/scheduler.service';

const mockPrismaService = {
  problem: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
  },
};

describe('ContentController', () => {
  let controller: ContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [
        ContentService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: SchedulerService, useValue: { getAdaptiveProblems: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ContentController>(ContentController);
  });

  describe('getStatus', () => {
    it('should return content module status', () => {
      const result = controller.getStatus();
      expect(result).toEqual({ module: 'content', status: 'operational' });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DigestService } from './digest.service';
import { EmailService } from './email.service';
import { PrismaService } from '../prisma/prisma.service';

const makeParent = (
  overrides: Partial<{
    id: string;
    email: string | null;
    displayName: string;
    parentLinks: {
      child: { id: string; displayName: string; grade: number; streakCount: number };
    }[];
  }> = {},
) => ({
  id: 'parent-1',
  email: 'parent@example.com',
  displayName: 'Jane Doe',
  parentLinks: [],
  ...overrides,
});

describe('DigestService', () => {
  let service: DigestService;
  let emailService: { sendWeeklyDigest: jest.Mock };
  let prisma: {
    user: { findMany: jest.Mock };
    studentProblemAttempt: { findMany: jest.Mock };
    pointsLedger: { findMany: jest.Mock };
    badge: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    emailService = { sendWeeklyDigest: jest.fn().mockResolvedValue(undefined) };

    prisma = {
      user: { findMany: jest.fn() },
      studentProblemAttempt: { findMany: jest.fn().mockResolvedValue([]) },
      pointsLedger: { findMany: jest.fn().mockResolvedValue([]) },
      badge: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DigestService,
        { provide: EmailService, useValue: emailService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DigestService>(DigestService);
  });

  it('skips parents with null email', async () => {
    prisma.user.findMany.mockResolvedValue([makeParent({ email: null })]);

    await service.sendWeeklyDigests();

    expect(emailService.sendWeeklyDigest).not.toHaveBeenCalled();
  });

  it('calls sendWeeklyDigest once per parent with linked children', async () => {
    const child = { id: 'child-1', displayName: 'Alice', grade: 2, streakCount: 5 };
    prisma.user.findMany.mockResolvedValue([makeParent({ parentLinks: [{ child }] })]);
    prisma.studentProblemAttempt.findMany.mockResolvedValue([
      { correct: true },
      { correct: false },
    ]);
    prisma.pointsLedger.findMany.mockResolvedValue([{ amount: 10 }, { amount: 5 }]);
    prisma.badge.findMany.mockResolvedValue([{ type: 'FIRST_CORRECT' }]);

    await service.sendWeeklyDigests();

    expect(emailService.sendWeeklyDigest).toHaveBeenCalledTimes(1);
    expect(emailService.sendWeeklyDigest).toHaveBeenCalledWith('parent@example.com', 'Jane Doe', [
      expect.objectContaining({
        name: 'Alice',
        grade: 2,
        xpEarned: 15,
        attemptsCount: 2,
        correctCount: 1,
        badgesEarned: ['FIRST_CORRECT'],
        streakCount: 5,
      }),
    ]);
  });

  it('sends empty summaries when parent has no linked children', async () => {
    prisma.user.findMany.mockResolvedValue([makeParent({ parentLinks: [] })]);

    await service.sendWeeklyDigests();

    expect(emailService.sendWeeklyDigest).toHaveBeenCalledTimes(1);
    expect(emailService.sendWeeklyDigest).toHaveBeenCalledWith(
      'parent@example.com',
      'Jane Doe',
      [],
    );
  });

  it('continues processing remaining parents if one send fails', async () => {
    const child = { id: 'child-2', displayName: 'Bob', grade: 3, streakCount: 2 };
    prisma.user.findMany.mockResolvedValue([
      makeParent({ id: 'parent-1', email: 'p1@example.com', parentLinks: [] }),
      makeParent({ id: 'parent-2', email: 'p2@example.com', parentLinks: [{ child }] }),
    ]);
    emailService.sendWeeklyDigest
      .mockRejectedValueOnce(new Error('SendGrid timeout'))
      .mockResolvedValueOnce(undefined);

    await service.sendWeeklyDigests();

    expect(emailService.sendWeeklyDigest).toHaveBeenCalledTimes(2);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UserService } from './user.service';
import { PrismaService } from '../prisma/prisma.service';

const mockParent = {
  id: '00000000-0000-0000-0000-000000000001',
  auth0Id: 'auth0|parent1',
  email: 'parent@example.com',
  role: UserRole.PARENT,
  displayName: 'Alice Zhang',
  username: null,
  grade: null,
  country: 'US',
  locale: 'en-US',
  avatarId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockChild = {
  id: '00000000-0000-0000-0000-000000000002',
  auth0Id: 'child_00000000-0000-0000-0000-000000000001_1234',
  email: null,
  role: UserRole.STUDENT,
  displayName: 'Bobby Zhang',
  username: 'bobbyzhang1234',
  grade: 2,
  country: 'US',
  locale: null,
  avatarId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTeacher = {
  id: '00000000-0000-0000-0000-000000000003',
  auth0Id: 'auth0|teacher1',
  email: 'teacher@school.edu',
  role: UserRole.TEACHER,
  displayName: 'Jane Smith',
  username: null,
  grade: null,
  country: 'US',
  locale: null,
  avatarId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSchool = {
  id: '00000000-0000-0000-0000-000000000010',
  name: 'Springfield Elementary',
  country: 'US',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    user: { findUnique: jest.Mock };
    school: { create: jest.Mock };
    schoolTeacher: { create: jest.Mock };
    parentChildLink: { create: jest.Mock };
    parentalConsent: { create: jest.Mock };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      school: { create: jest.fn() },
      schoolTeacher: { create: jest.fn() },
      parentChildLink: { create: jest.fn() },
      parentalConsent: { create: jest.fn() },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('getStatus', () => {
    it('should return operational status', () => {
      expect(service.getStatus()).toEqual({
        module: 'user',
        status: 'operational',
      });
    });
  });

  describe('findByAuth0Id', () => {
    it('should find a user by auth0 id', async () => {
      prisma.user.findUnique.mockResolvedValue(mockParent);
      const result = await service.findByAuth0Id('auth0|parent1');
      expect(result).toEqual(mockParent);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { auth0Id: 'auth0|parent1' },
      });
    });

    it('should return null for non-existent user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const result = await service.findByAuth0Id('auth0|nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('createChildAccount', () => {
    const dto = {
      name: 'Bobby Zhang',
      grade: 2,
      password: 'secret123',
      consent: {
        accepted: true,
        timestamp: '2026-05-10T12:00:00Z',
        consent_version: 'v1.2',
      },
    };

    it('should create a child account linked to parent with consent record', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(mockParent)
        .mockResolvedValueOnce(null);

      prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          user: { create: jest.fn().mockResolvedValue(mockChild) },
          parentChildLink: { create: jest.fn().mockResolvedValue({}) },
          parentalConsent: { create: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx);
      });

      const result = await service.createChildAccount(
        'auth0|parent1',
        dto,
        '192.168.1.1',
      );

      expect(result.name).toBe('Bobby Zhang');
      expect(result.role).toBe('student');
      expect(result.grade).toBe(2);
      expect(result.linked_parent_ids).toContain(mockParent.id);
    });

    it('should throw NotFoundException if parent not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createChildAccount('auth0|nonexistent', dto, '1.2.3.4'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a parent', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockTeacher,
        auth0Id: 'auth0|teacher1',
      });

      await expect(
        service.createChildAccount('auth0|teacher1', dto, '1.2.3.4'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if consent not accepted', async () => {
      prisma.user.findUnique.mockResolvedValue(mockParent);

      const noConsentDto = {
        ...dto,
        consent: { ...dto.consent, accepted: false },
      };

      await expect(
        service.createChildAccount('auth0|parent1', noConsentDto, '1.2.3.4'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if generated username is taken', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(mockParent)
        .mockResolvedValueOnce({ id: 'existing' });

      await expect(
        service.createChildAccount('auth0|parent1', dto, '1.2.3.4'),
      ).rejects.toThrow(ConflictException);
    });

    it('should not collect email from child account (COPPA)', async () => {
      prisma.user.findUnique
        .mockResolvedValueOnce(mockParent)
        .mockResolvedValueOnce(null);

      prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          user: {
            create: jest.fn().mockImplementation((args) => {
              expect(args.data.email).toBeUndefined();
              return mockChild;
            }),
          },
          parentChildLink: { create: jest.fn().mockResolvedValue({}) },
          parentalConsent: { create: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx);
      });

      await service.createChildAccount('auth0|parent1', dto, '1.2.3.4');
    });
  });

  describe('listChildren', () => {
    it('should return children linked to parent', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockParent,
        parentLinks: [
          {
            child: {
              ...mockChild,
              enrollments: [],
            },
          },
        ],
      });

      const result = await service.listChildren('auth0|parent1');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bobby Zhang');
      expect(result[0].role).toBe('student');
    });

    it('should throw NotFoundException if parent not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.listChildren('auth0|nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSchool', () => {
    const dto = { name: 'Springfield Elementary', country: 'US' };

    it('should create a school and assign teacher as admin', async () => {
      prisma.user.findUnique.mockResolvedValue(mockTeacher);

      prisma.$transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => {
        const tx = {
          school: { create: jest.fn().mockResolvedValue(mockSchool) },
          schoolTeacher: { create: jest.fn().mockResolvedValue({}) },
        };
        return fn(tx);
      });

      const result = await service.createSchool('auth0|teacher1', dto);
      expect(result.name).toBe('Springfield Elementary');
      expect(result.country).toBe('US');
    });

    it('should throw NotFoundException if teacher not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createSchool('auth0|nonexistent', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not teacher/admin', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockParent,
        role: UserRole.STUDENT,
      });

      await expect(
        service.createSchool('auth0|parent1', dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

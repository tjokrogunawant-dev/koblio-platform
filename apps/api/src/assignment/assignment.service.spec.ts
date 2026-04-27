import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Difficulty } from '@prisma/client';
import { AssignmentService } from './assignment.service';
import { PrismaService } from '../prisma/prisma.service';
import { AttemptService } from '../attempt/attempt.service';

const TEACHER_AUTH0 = 'auth0|teacher1';
const STUDENT_AUTH0 = 'auth0|student1';

const mockTeacher = {
  id: '00000000-0000-0000-0000-000000000003',
  auth0Id: TEACHER_AUTH0,
  displayName: 'Jane Smith',
};

const mockStudent = {
  id: '00000000-0000-0000-0000-000000000002',
  auth0Id: STUDENT_AUTH0,
  displayName: 'Bobby Zhang',
};

const mockClassroom = {
  id: '00000000-0000-0000-0000-000000000020',
  name: '3A',
  grade: 3,
  classCode: 'SUN-DRAGON-42',
  teacherId: mockTeacher.id,
  schoolId: null,
};

const mockAssignment = {
  id: '00000000-0000-0000-0000-000000000030',
  classroomId: mockClassroom.id,
  teacherId: mockTeacher.id,
  title: 'Week 1 Addition',
  topic: 'addition',
  strand: 'operations',
  grade: 3,
  difficulty: Difficulty.EASY,
  problemIds: ['00000000-0000-0000-0000-000000000100'],
  dueDate: null,
  createdAt: new Date('2026-04-27'),
  updatedAt: new Date('2026-04-27'),
};

describe('AssignmentService', () => {
  let service: AssignmentService;
  let prisma: {
    user: { findUnique: jest.Mock };
    classroom: { findUnique: jest.Mock };
    assignment: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
    };
    assignmentSubmission: {
      findMany: jest.Mock;
      upsert: jest.Mock;
    };
  };
  let attemptService: { submitAnswer: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      classroom: { findUnique: jest.fn() },
      assignment: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      assignmentSubmission: {
        findMany: jest.fn(),
        upsert: jest.fn(),
      },
    };

    attemptService = {
      submitAnswer: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentService,
        { provide: PrismaService, useValue: prisma },
        { provide: AttemptService, useValue: attemptService },
      ],
    }).compile();

    service = module.get<AssignmentService>(AssignmentService);
  });

  // ─── createAssignment ────────────────────────────────────────────────────

  describe('createAssignment', () => {
    const dto = {
      classroomId: mockClassroom.id,
      title: 'Week 1 Addition',
      topic: 'addition',
      strand: 'operations',
      grade: 3,
      difficulty: Difficulty.EASY,
      problemIds: ['00000000-0000-0000-0000-000000000100'],
    };

    it('should create an assignment', async () => {
      prisma.user.findUnique.mockResolvedValue(mockTeacher);
      prisma.classroom.findUnique.mockResolvedValue(mockClassroom);
      prisma.assignment.create.mockResolvedValue(mockAssignment);

      const result = await service.createAssignment(TEACHER_AUTH0, dto);

      expect(result.title).toBe('Week 1 Addition');
      expect(result.classroomId).toBe(mockClassroom.id);
      expect(prisma.assignment.create).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if teacher not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createAssignment('auth0|unknown', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if classroom not found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockTeacher);
      prisma.classroom.findUnique.mockResolvedValue(null);

      await expect(
        service.createAssignment(TEACHER_AUTH0, dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if teacher does not own the classroom', async () => {
      prisma.user.findUnique.mockResolvedValue(mockTeacher);
      prisma.classroom.findUnique.mockResolvedValue({
        ...mockClassroom,
        teacherId: 'different-teacher-id',
      });

      await expect(
        service.createAssignment(TEACHER_AUTH0, dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ─── listTeacherAssignments ──────────────────────────────────────────────

  describe('listTeacherAssignments', () => {
    it('should return teacher assignments with submission counts', async () => {
      prisma.user.findUnique.mockResolvedValue(mockTeacher);
      prisma.assignment.findMany.mockResolvedValue([
        {
          ...mockAssignment,
          classroom: { name: '3A' },
          _count: { submissions: 5 },
        },
      ]);

      const result = await service.listTeacherAssignments(TEACHER_AUTH0);

      expect(result).toHaveLength(1);
      expect(result[0].submissionCount).toBe(5);
      expect(result[0].classroomName).toBe('3A');
    });

    it('should throw NotFoundException if teacher not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.listTeacherAssignments('auth0|unknown'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getStudentAssignments ───────────────────────────────────────────────

  describe('getStudentAssignments', () => {
    it('should return pending assignments for student', async () => {
      prisma.user.findUnique.mockResolvedValue(mockStudent);
      prisma.assignment.findMany.mockResolvedValue([
        {
          ...mockAssignment,
          classroom: { name: '3A' },
        },
      ]);
      // No submissions yet
      prisma.assignmentSubmission.findMany.mockResolvedValue([]);

      const result = await service.getStudentAssignments(STUDENT_AUTH0);

      expect(result).toHaveLength(1);
      expect(result[0].pendingCount).toBe(1);
    });

    it('should exclude completed assignments', async () => {
      prisma.user.findUnique.mockResolvedValue(mockStudent);
      prisma.assignment.findMany.mockResolvedValue([
        {
          ...mockAssignment,
          classroom: { name: '3A' },
        },
      ]);
      // All problems submitted
      prisma.assignmentSubmission.findMany.mockResolvedValue([
        { problemId: mockAssignment.problemIds[0] },
      ]);

      const result = await service.getStudentAssignments(STUDENT_AUTH0);

      expect(result).toHaveLength(0);
    });

    it('should throw NotFoundException if student not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.getStudentAssignments('auth0|unknown'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── submitAssignment ────────────────────────────────────────────────────

  describe('submitAssignment', () => {
    const dto = {
      answers: [
        {
          problemId: mockAssignment.problemIds[0],
          answer: '42',
        },
      ],
    };

    const mockAssignmentWithEnrollment = {
      ...mockAssignment,
      classroom: {
        ...mockClassroom,
        enrollments: [{ studentId: mockStudent.id }],
      },
    };

    it('should submit answers and return correct count', async () => {
      prisma.user.findUnique.mockResolvedValue(mockStudent);
      prisma.assignment.findUnique.mockResolvedValue(
        mockAssignmentWithEnrollment,
      );
      attemptService.submitAnswer.mockResolvedValue({
        correct: true,
        correctAnswer: '42',
        attemptId: 'attempt-uuid',
        solution: '42',
        coinsEarned: 3,
        xpEarned: 5,
        leveledUp: false,
      });
      prisma.assignmentSubmission.upsert.mockResolvedValue({});

      const result = await service.submitAssignment(
        STUDENT_AUTH0,
        mockAssignment.id,
        dto,
      );

      expect(result.correct).toBe(1);
      expect(result.total).toBe(1);
      expect(result.results[0].correct).toBe(true);
    });

    it('should throw NotFoundException if assignment not found', async () => {
      prisma.user.findUnique.mockResolvedValue(mockStudent);
      prisma.assignment.findUnique.mockResolvedValue(null);

      await expect(
        service.submitAssignment(STUDENT_AUTH0, 'nonexistent', dto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if student not enrolled', async () => {
      prisma.user.findUnique.mockResolvedValue(mockStudent);
      prisma.assignment.findUnique.mockResolvedValue({
        ...mockAssignment,
        classroom: { ...mockClassroom, enrollments: [] },
      });

      await expect(
        service.submitAssignment(STUDENT_AUTH0, mockAssignment.id, dto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});

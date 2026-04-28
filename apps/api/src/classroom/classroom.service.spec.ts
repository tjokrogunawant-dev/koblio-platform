import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ClassroomService } from './classroom.service';
import { PrismaService } from '../prisma/prisma.service';

const mockTeacher = {
  id: '00000000-0000-0000-0000-000000000003',
  auth0Id: 'auth0|teacher1',
  role: UserRole.TEACHER,
  displayName: 'Jane Smith',
};

const mockStudent = {
  id: '00000000-0000-0000-0000-000000000002',
  auth0Id: 'child_1234',
  role: UserRole.STUDENT,
  displayName: 'Bobby Zhang',
  username: 'bobby1234',
  grade: 2,
  country: 'US',
};

const mockClassroom = {
  id: '00000000-0000-0000-0000-000000000020',
  name: '3A',
  grade: 3,
  classCode: 'SUN-DRAGON-42',
  teacherId: mockTeacher.id,
  schoolId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('ClassroomService', () => {
  let service: ClassroomService;
  let prisma: {
    user: { findUnique: jest.Mock };
    classroom: { create: jest.Mock; findUnique: jest.Mock; findMany: jest.Mock };
    enrollment: {
      create: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
    schoolTeacher: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn() },
      classroom: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      enrollment: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      schoolTeacher: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassroomService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<ClassroomService>(ClassroomService);
  });

  describe('getStatus', () => {
    it('should return operational status', () => {
      expect(service.getStatus()).toEqual({
        module: 'classroom',
        status: 'operational',
      });
    });
  });

  describe('createClassroom', () => {
    const dto = { name: '3A', grade: 3 };

    it('should create a classroom for a teacher', async () => {
      prisma.user.findUnique.mockResolvedValue(mockTeacher);
      prisma.classroom.create.mockResolvedValue(mockClassroom);

      const result = await service.createClassroom('auth0|teacher1', dto);

      expect(result.name).toBe('3A');
      expect(result.grade).toBe(3);
      expect(result.teacher_id).toBe(mockTeacher.id);
      expect(result.class_code).toBeDefined();
      expect(result.student_count).toBe(0);
    });

    it('should throw NotFoundException if teacher not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.createClassroom('auth0|unknown', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if user is not a teacher', async () => {
      prisma.user.findUnique.mockResolvedValue({
        ...mockStudent,
        auth0Id: 'auth0|student',
      });

      await expect(service.createClassroom('auth0|student', dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should verify school membership when school_id provided', async () => {
      prisma.user.findUnique.mockResolvedValue(mockTeacher);
      prisma.schoolTeacher.findUnique.mockResolvedValue(null);

      await expect(
        service.createClassroom('auth0|teacher1', {
          ...dto,
          school_id: '00000000-0000-0000-0000-000000000010',
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('listTeacherClassrooms', () => {
    it('should return classrooms with student counts', async () => {
      prisma.user.findUnique.mockResolvedValue(mockTeacher);
      prisma.classroom.findMany.mockResolvedValue([
        { ...mockClassroom, _count: { enrollments: 5 } },
      ]);

      const result = await service.listTeacherClassrooms('auth0|teacher1');

      expect(result).toHaveLength(1);
      expect(result[0].student_count).toBe(5);
      expect(result[0].class_code).toBe('SUN-DRAGON-42');
    });

    it('should throw NotFoundException if teacher not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.listTeacherClassrooms('auth0|unknown')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('enrollStudent', () => {
    const dto = { student_id: mockStudent.id };
    const classroomId = mockClassroom.id;

    it('should enroll a student in a classroom', async () => {
      prisma.classroom.findUnique.mockResolvedValue(mockClassroom);
      prisma.user.findUnique.mockResolvedValue(mockStudent);
      prisma.enrollment.findUnique.mockResolvedValue(null);
      prisma.enrollment.create.mockResolvedValue({
        id: 'enrollment-1',
        studentId: mockStudent.id,
        classroomId,
        enrolledAt: new Date('2026-05-10'),
      });

      const result = await service.enrollStudent(classroomId, dto);

      expect(result.student_id).toBe(mockStudent.id);
      expect(result.classroom_id).toBe(classroomId);
    });

    it('should throw NotFoundException if classroom not found', async () => {
      prisma.classroom.findUnique.mockResolvedValue(null);

      await expect(service.enrollStudent('nonexistent', dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if student not found', async () => {
      prisma.classroom.findUnique.mockResolvedValue(mockClassroom);
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.enrollStudent(classroomId, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not a student', async () => {
      prisma.classroom.findUnique.mockResolvedValue(mockClassroom);
      prisma.user.findUnique.mockResolvedValue({
        ...mockTeacher,
        role: UserRole.TEACHER,
      });

      await expect(service.enrollStudent(classroomId, dto)).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException if student already enrolled', async () => {
      prisma.classroom.findUnique.mockResolvedValue(mockClassroom);
      prisma.user.findUnique.mockResolvedValue(mockStudent);
      prisma.enrollment.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.enrollStudent(classroomId, dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('listClassroomStudents', () => {
    it('should return enrolled students', async () => {
      prisma.classroom.findUnique.mockResolvedValue(mockClassroom);
      prisma.enrollment.findMany.mockResolvedValue([
        {
          student: mockStudent,
          enrolledAt: new Date('2026-05-10'),
        },
      ]);

      const result = await service.listClassroomStudents(mockClassroom.id);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bobby Zhang');
      expect(result[0].role).toBe('student');
    });

    it('should throw NotFoundException if classroom not found', async () => {
      prisma.classroom.findUnique.mockResolvedValue(null);

      await expect(service.listClassroomStudents('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});

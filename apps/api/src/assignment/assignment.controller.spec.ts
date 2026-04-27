import { Test, TestingModule } from '@nestjs/testing';
import { Difficulty } from '@prisma/client';
import { AssignmentController } from './assignment.controller';
import { AssignmentService } from './assignment.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

const teacherUser: AuthenticatedUser = {
  userId: 'auth0|teacher1',
  roles: ['teacher'],
};

const studentUser: AuthenticatedUser = {
  userId: 'auth0|student1',
  roles: ['student'],
};

const mockAssignmentResult = {
  id: '00000000-0000-0000-0000-000000000030',
  title: 'Week 1',
  classroomId: '00000000-0000-0000-0000-000000000020',
  classroomName: '3A',
  teacherId: '00000000-0000-0000-0000-000000000003',
  topic: 'addition',
  strand: 'operations',
  grade: 3,
  difficulty: Difficulty.EASY,
  problemIds: ['00000000-0000-0000-0000-000000000100'],
  dueDate: null,
  submissionCount: 0,
  createdAt: '2026-04-27T00:00:00.000Z',
  updatedAt: '2026-04-27T00:00:00.000Z',
};

describe('AssignmentController', () => {
  let controller: AssignmentController;
  let service: {
    createAssignment: jest.Mock;
    listTeacherAssignments: jest.Mock;
    getStudentAssignments: jest.Mock;
    submitAssignment: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      createAssignment: jest.fn(),
      listTeacherAssignments: jest.fn(),
      getStudentAssignments: jest.fn(),
      submitAssignment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignmentController],
      providers: [{ provide: AssignmentService, useValue: service }],
    }).compile();

    controller = module.get<AssignmentController>(AssignmentController);
  });

  describe('createAssignment', () => {
    it('should call service with teacher userId and dto', async () => {
      const dto = {
        classroomId: '00000000-0000-0000-0000-000000000020',
        title: 'Week 1',
        topic: 'addition',
        strand: 'operations',
        grade: 3,
        difficulty: Difficulty.EASY,
        problemIds: ['00000000-0000-0000-0000-000000000100'],
      };
      service.createAssignment.mockResolvedValue(mockAssignmentResult);

      const result = await controller.createAssignment(teacherUser, dto);

      expect(service.createAssignment).toHaveBeenCalledWith(
        'auth0|teacher1',
        dto,
      );
      expect(result).toEqual(mockAssignmentResult);
    });
  });

  describe('listMyAssignments', () => {
    it('should call listTeacherAssignments with teacher userId', async () => {
      service.listTeacherAssignments.mockResolvedValue([mockAssignmentResult]);

      const result = await controller.listMyAssignments(teacherUser);

      expect(service.listTeacherAssignments).toHaveBeenCalledWith(
        'auth0|teacher1',
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('getStudentAssignments', () => {
    it('should call getStudentAssignments with student userId', async () => {
      service.getStudentAssignments.mockResolvedValue([]);

      const result = await controller.getStudentAssignments(studentUser);

      expect(service.getStudentAssignments).toHaveBeenCalledWith(
        'auth0|student1',
      );
      expect(result).toEqual([]);
    });
  });

  describe('submitAssignment', () => {
    it('should call submitAssignment and return result', async () => {
      const dto = {
        answers: [
          { problemId: '00000000-0000-0000-0000-000000000100', answer: '5' },
        ],
      };
      const expected = { correct: 1, total: 1, results: [] };
      service.submitAssignment.mockResolvedValue(expected);

      const result = await controller.submitAssignment(
        studentUser,
        '00000000-0000-0000-0000-000000000030',
        dto,
      );

      expect(service.submitAssignment).toHaveBeenCalledWith(
        'auth0|student1',
        '00000000-0000-0000-0000-000000000030',
        dto,
      );
      expect(result).toEqual(expected);
    });
  });
});

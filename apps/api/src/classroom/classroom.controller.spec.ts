import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomController } from './classroom.controller';
import { ClassroomService } from './classroom.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

describe('ClassroomController', () => {
  let controller: ClassroomController;
  let classroomService: { [K in keyof ClassroomService]: jest.Mock };

  beforeEach(async () => {
    classroomService = {
      getStatus: jest.fn(),
      createClassroom: jest.fn(),
      listTeacherClassrooms: jest.fn(),
      enrollStudent: jest.fn(),
      listClassroomStudents: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ClassroomController],
      providers: [
        { provide: ClassroomService, useValue: classroomService },
      ],
    }).compile();

    controller = module.get<ClassroomController>(ClassroomController);
  });

  describe('getStatus', () => {
    it('should return classroom module status', () => {
      classroomService.getStatus.mockReturnValue({
        module: 'classroom',
        status: 'operational',
      });
      expect(controller.getStatus()).toEqual({
        module: 'classroom',
        status: 'operational',
      });
    });
  });

  describe('createClassroom', () => {
    it('should call createClassroom with correct args', async () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|teacher1',
        roles: ['teacher'],
      };
      const dto = { name: '3A', grade: 3 };
      const expected = {
        id: 'classroom-1',
        name: '3A',
        grade: 3,
        class_code: 'SUN-DRAGON-42',
      };

      classroomService.createClassroom.mockResolvedValue(expected);

      const result = await controller.createClassroom(user, dto);

      expect(classroomService.createClassroom).toHaveBeenCalledWith(
        'auth0|teacher1',
        dto,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('listMyClassrooms', () => {
    it('should call listTeacherClassrooms', async () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|teacher1',
        roles: ['teacher'],
      };

      classroomService.listTeacherClassrooms.mockResolvedValue([]);

      const result = await controller.listMyClassrooms(user);

      expect(classroomService.listTeacherClassrooms).toHaveBeenCalledWith(
        'auth0|teacher1',
      );
      expect(result).toEqual([]);
    });
  });

  describe('enrollStudent', () => {
    it('should call enrollStudent with correct args', async () => {
      const dto = {
        student_id: '00000000-0000-0000-0000-000000000002',
      };

      classroomService.enrollStudent.mockResolvedValue({
        id: 'enrollment-1',
      });

      const result = await controller.enrollStudent('classroom-id', dto);

      expect(classroomService.enrollStudent).toHaveBeenCalledWith(
        'classroom-id',
        dto,
      );
      expect(result).toEqual({ id: 'enrollment-1' });
    });
  });

  describe('listStudents', () => {
    it('should call listClassroomStudents', async () => {
      classroomService.listClassroomStudents.mockResolvedValue([]);

      const result = await controller.listStudents('classroom-id');

      expect(classroomService.listClassroomStudents).toHaveBeenCalledWith(
        'classroom-id',
      );
      expect(result).toEqual([]);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

describe('UserController', () => {
  let controller: UserController;
  let userService: { [K in keyof UserService]: jest.Mock };

  beforeEach(async () => {
    userService = {
      getStatus: jest.fn(),
      findByAuth0Id: jest.fn(),
      createChildAccount: jest.fn(),
      listChildren: jest.fn(),
      getChild: jest.fn(),
      joinClassByCode: jest.fn(),
      createSchool: jest.fn(),
      getSchool: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: userService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('getStatus', () => {
    it('should return user module status', () => {
      userService.getStatus.mockReturnValue({
        module: 'user',
        status: 'operational',
      });
      expect(controller.getStatus()).toEqual({
        module: 'user',
        status: 'operational',
      });
    });
  });

  describe('createChild', () => {
    it('should call createChildAccount with correct args', async () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|parent1',
        email: 'parent@test.com',
        roles: ['parent'],
      };
      const dto = {
        name: 'Child',
        grade: 2,
        password: 'secret123',
        consent: {
          accepted: true,
          timestamp: '2026-05-10T12:00:00Z',
        },
      };

      userService.createChildAccount.mockResolvedValue({ id: 'child-1' });

      const result = await controller.createChild(user, dto, '10.0.0.1');

      expect(userService.createChildAccount).toHaveBeenCalledWith('auth0|parent1', dto, '10.0.0.1');
      expect(result).toEqual({ id: 'child-1' });
    });

    it('should default to unknown when ip is empty', async () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|parent1',
        roles: ['parent'],
      };
      const dto = {
        name: 'Child',
        grade: 3,
        password: 'secret123',
        consent: { accepted: true, timestamp: '2026-05-10T12:00:00Z' },
      };

      userService.createChildAccount.mockResolvedValue({ id: 'child-2' });

      await controller.createChild(user, dto, '');

      expect(userService.createChildAccount).toHaveBeenCalledWith('auth0|parent1', dto, 'unknown');
    });
  });

  describe('listChildren', () => {
    it('should call listChildren', async () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|parent1',
        roles: ['parent'],
      };
      userService.listChildren.mockResolvedValue([]);

      const result = await controller.listChildren(user);

      expect(userService.listChildren).toHaveBeenCalledWith('auth0|parent1');
      expect(result).toEqual([]);
    });
  });

  describe('getChild', () => {
    it('should call getChild with correct args', async () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|parent1',
        roles: ['parent'],
      };
      const childId = '00000000-0000-0000-0000-000000000002';
      const expected = { id: childId, role: 'student', name: 'Bobby Zhang' };

      userService.getChild.mockResolvedValue(expected);

      const result = await controller.getChild(user, childId);

      expect(userService.getChild).toHaveBeenCalledWith('auth0|parent1', childId);
      expect(result).toEqual(expected);
    });
  });

  describe('joinClass', () => {
    it('should call joinClassByCode with correct args', async () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|parent1',
        roles: ['parent'],
      };
      const childId = '00000000-0000-0000-0000-000000000002';
      const dto = { class_code: 'SUN-DRAGON-42' };
      const expected = {
        id: childId,
        role: 'student',
        classroom_id: '00000000-0000-0000-0000-000000000020',
      };

      userService.joinClassByCode.mockResolvedValue(expected);

      const result = await controller.joinClass(user, childId, dto);

      expect(userService.joinClassByCode).toHaveBeenCalledWith('auth0|parent1', childId, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('createSchool', () => {
    it('should call createSchool', async () => {
      const user: AuthenticatedUser = {
        userId: 'auth0|teacher1',
        roles: ['teacher'],
      };
      const dto = { name: 'Test School', country: 'US' };

      userService.createSchool.mockResolvedValue({
        id: 'school-1',
        name: 'Test School',
      });

      const result = await controller.createSchool(user, dto);

      expect(userService.createSchool).toHaveBeenCalledWith('auth0|teacher1', dto);
      expect(result).toEqual({ id: 'school-1', name: 'Test School' });
    });
  });

  describe('getSchool', () => {
    it('should call getSchool with school id', async () => {
      const schoolId = '00000000-0000-0000-0000-000000000010';
      const expected = {
        id: schoolId,
        name: 'Springfield Elementary',
        teacher_count: 3,
        classroom_count: 5,
      };

      userService.getSchool.mockResolvedValue(expected);

      const result = await controller.getSchool(schoolId);

      expect(userService.getSchool).toHaveBeenCalledWith(schoolId);
      expect(result).toEqual(expected);
    });
  });
});

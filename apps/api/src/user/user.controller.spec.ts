import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  describe('getStatus', () => {
    it('should return user module status', () => {
      const result = controller.getStatus();
      expect(result).toEqual({ module: 'user', status: 'operational' });
    });
  });
});

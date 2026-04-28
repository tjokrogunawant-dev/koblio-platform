import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('should return status ok', async () => {
      const mockJson = jest.fn();
      const mockRes = { status: jest.fn().mockReturnValue({ json: mockJson }), json: mockJson };
      await controller.getHealth(mockRes as never);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({ status: expect.any(String) }),
      );
    });
  });
});

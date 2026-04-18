import { Test, TestingModule } from '@nestjs/testing';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

describe('ContentController', () => {
  let controller: ContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentController],
      providers: [ContentService],
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

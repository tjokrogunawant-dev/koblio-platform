import { Test, TestingModule } from '@nestjs/testing';
import { SentryController } from './sentry.controller';

describe('SentryController', () => {
  let controller: SentryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SentryController],
    }).compile();

    controller = module.get<SentryController>(SentryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('triggerError should throw an Error', () => {
    expect(() => controller.triggerError()).toThrow(
      'Sentry test error from Koblio API',
    );
  });
});

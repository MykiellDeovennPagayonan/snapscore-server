import { Test, TestingModule } from '@nestjs/testing';
import { EssayController } from './essay.controller';

describe('EssayController', () => {
  let controller: EssayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EssayController],
    }).compile();

    controller = module.get<EssayController>(EssayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

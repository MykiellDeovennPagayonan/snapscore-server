import { Test, TestingModule } from '@nestjs/testing';
import { EssayResultsController } from './essay-results.controller';

describe('EssayResultsController', () => {
  let controller: EssayResultsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EssayResultsController],
    }).compile();

    controller = module.get<EssayResultsController>(EssayResultsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

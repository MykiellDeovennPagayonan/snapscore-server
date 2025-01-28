import { Test, TestingModule } from '@nestjs/testing';
import { EssayQuestionsController } from './essay-questions.controller';

describe('EssayQuestionsController', () => {
  let controller: EssayQuestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EssayQuestionsController],
    }).compile();

    controller = module.get<EssayQuestionsController>(EssayQuestionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

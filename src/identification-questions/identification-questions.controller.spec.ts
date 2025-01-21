import { Test, TestingModule } from '@nestjs/testing';
import { IdentificationQuestionsController } from './identification-questions.controller';

describe('IdentificationQuestionsController', () => {
  let controller: IdentificationQuestionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdentificationQuestionsController],
    }).compile();

    controller = module.get<IdentificationQuestionsController>(
      IdentificationQuestionsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

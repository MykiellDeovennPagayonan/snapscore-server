import { Test, TestingModule } from '@nestjs/testing';
import { EssayAssessmentController } from './essay-assessment.controller';

describe('EssayAssessmentController', () => {
  let controller: EssayAssessmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EssayAssessmentController],
    }).compile();

    controller = module.get<EssayAssessmentController>(
      EssayAssessmentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

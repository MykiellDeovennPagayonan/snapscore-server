import { Test, TestingModule } from '@nestjs/testing';
import { IdentificationAssessmentController } from './identification-assessment.controller';

describe('IdentificationAssessmentController', () => {
  let controller: IdentificationAssessmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdentificationAssessmentController],
    }).compile();

    controller = module.get<IdentificationAssessmentController>(
      IdentificationAssessmentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

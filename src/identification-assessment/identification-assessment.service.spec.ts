import { Test, TestingModule } from '@nestjs/testing';
import { IdentificationAssessmentService } from './identification-assessment.service';

describe('IdentificationAssessmentService', () => {
  let service: IdentificationAssessmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdentificationAssessmentService],
    }).compile();

    service = module.get<IdentificationAssessmentService>(
      IdentificationAssessmentService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

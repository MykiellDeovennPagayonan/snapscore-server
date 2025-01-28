import { Test, TestingModule } from '@nestjs/testing';
import { EssayAssessmentService } from './essay-assessment.service';

describe('EssayAssessmentService', () => {
  let service: EssayAssessmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EssayAssessmentService],
    }).compile();

    service = module.get<EssayAssessmentService>(EssayAssessmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

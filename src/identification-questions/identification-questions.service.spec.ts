import { Test, TestingModule } from '@nestjs/testing';
import { IdentificationQuestionsService } from './identification-questions.service';

describe('IdentificationQuestionsService', () => {
  let service: IdentificationQuestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdentificationQuestionsService],
    }).compile();

    service = module.get<IdentificationQuestionsService>(
      IdentificationQuestionsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

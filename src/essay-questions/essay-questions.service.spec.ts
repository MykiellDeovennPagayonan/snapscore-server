import { Test, TestingModule } from '@nestjs/testing';
import { EssayQuestionsService } from './essay-questions.service';

describe('EssayQuestionsService', () => {
  let service: EssayQuestionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EssayQuestionsService],
    }).compile();

    service = module.get<EssayQuestionsService>(EssayQuestionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

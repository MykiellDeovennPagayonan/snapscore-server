import { Test, TestingModule } from '@nestjs/testing';
import { EssayResultsService } from './essay-results.service';

describe('EssayResultsService', () => {
  let service: EssayResultsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EssayResultsService],
    }).compile();

    service = module.get<EssayResultsService>(EssayResultsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

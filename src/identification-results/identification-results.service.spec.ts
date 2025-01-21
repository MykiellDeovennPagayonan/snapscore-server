import { Test, TestingModule } from '@nestjs/testing';
import { IdentificationResultsService } from './identification-results.service';

describe('IdentificationResultsService', () => {
  let service: IdentificationResultsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdentificationResultsService],
    }).compile();

    service = module.get<IdentificationResultsService>(
      IdentificationResultsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

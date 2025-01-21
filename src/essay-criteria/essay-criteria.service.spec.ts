import { Test, TestingModule } from '@nestjs/testing';
import { EssayCriteriaService } from './essay-criteria.service';

describe('EssayCriteriaService', () => {
  let service: EssayCriteriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EssayCriteriaService],
    }).compile();

    service = module.get<EssayCriteriaService>(EssayCriteriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

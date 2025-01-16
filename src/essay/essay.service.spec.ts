import { Test, TestingModule } from '@nestjs/testing';
import { EssayService } from './essay.service';

describe('EssayService', () => {
  let service: EssayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EssayService],
    }).compile();

    service = module.get<EssayService>(EssayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

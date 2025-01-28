import { Test, TestingModule } from '@nestjs/testing';
import { IdentificationResultsController } from './identification-results.controller';

describe('IdentificationResultsController', () => {
  let controller: IdentificationResultsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdentificationResultsController],
    }).compile();

    controller = module.get<IdentificationResultsController>(
      IdentificationResultsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

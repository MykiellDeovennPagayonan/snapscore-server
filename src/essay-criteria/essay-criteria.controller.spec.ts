import { Test, TestingModule } from '@nestjs/testing';
import { EssayCriteriaController } from './essay-criteria.controller';

describe('EssayCriteriaController', () => {
  let controller: EssayCriteriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EssayCriteriaController],
    }).compile();

    controller = module.get<EssayCriteriaController>(EssayCriteriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

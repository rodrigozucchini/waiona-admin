import { Test, TestingModule } from '@nestjs/testing';
import { DiscountTypesController } from './discount-types.admin.controller';

describe('DiscountTypesController', () => {
  let controller: DiscountTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountTypesController],
    }).compile();

    controller = module.get<DiscountTypesController>(DiscountTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DiscountsController } from './discounts.admin.controller';
import { DiscountsService } from './discounts.admin.service';

describe('DiscountsController', () => {
  let controller: DiscountsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiscountsController],
      providers: [DiscountsService],
    }).compile();

    controller = module.get<DiscountsController>(DiscountsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

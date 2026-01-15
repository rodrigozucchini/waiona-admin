import { Test, TestingModule } from '@nestjs/testing';
import { DiscountTypesService } from './discount-types.service';

describe('DiscountTypesService', () => {
  let service: DiscountTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountTypesService],
    }).compile();

    service = module.get<DiscountTypesService>(DiscountTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DiscountTypeAdminService } from './discount-types.admin.service';

describe('DiscountTypesService', () => {
  let service: DiscountTypeAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscountTypeAdminService],
    }).compile();

    service = module.get<DiscountTypeAdminService>(DiscountTypeAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

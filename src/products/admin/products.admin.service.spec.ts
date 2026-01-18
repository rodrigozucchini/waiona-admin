import { Test, TestingModule } from '@nestjs/testing';
import { ProductAdminService } from './products.admin.service';

describe('ProductAdminService', () => {
  let service: ProductAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductAdminService],
    }).compile();

    service = module.get<ProductAdminService>(ProductAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

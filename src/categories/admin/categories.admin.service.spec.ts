import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesAdminService } from './categories.admin.service';

describe('CategoriesAdminService', () => {
  let service: CategoriesAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesAdminService],
    }).compile();

    service = module.get<CategoriesAdminService>(CategoriesAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

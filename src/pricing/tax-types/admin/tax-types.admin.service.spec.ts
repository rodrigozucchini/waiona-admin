import { Test, TestingModule } from '@nestjs/testing';
import { TaxTypeAdminService } from './tax-types.admin.service';

describe('TaxTypesService', () => {
  let service: TaxTypeAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaxTypeAdminService],
    }).compile();

    service = module.get<TaxTypeAdminService>(TaxTypeAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

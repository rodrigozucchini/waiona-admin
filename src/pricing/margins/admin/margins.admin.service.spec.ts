import { Test, TestingModule } from '@nestjs/testing';
import { MarginAdminService } from './margins.admin.service';

describe('MarginsService', () => {
  let service: MarginAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarginAdminService],
    }).compile();

    service = module.get<MarginAdminService>(MarginAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

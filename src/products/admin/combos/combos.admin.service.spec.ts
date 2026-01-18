import { Test, TestingModule } from '@nestjs/testing';
import { ComboAdminService } from './combos.admin.service';

describe('CombosService', () => {
  let service: ComboAdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComboAdminService],
    }).compile();

    service = module.get<ComboAdminService>(ComboAdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

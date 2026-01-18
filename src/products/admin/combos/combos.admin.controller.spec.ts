import { Test, TestingModule } from '@nestjs/testing';
import { ComboAdminController } from './combos.admin.controller';

describe('CombosController', () => {
  let controller: ComboAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComboAdminController],
    }).compile();

    controller = module.get<ComboAdminController>(ComboAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

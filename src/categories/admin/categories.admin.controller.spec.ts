import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesAdminController } from './categories.admin.controller';

describe('CategoriesAdminController', () => {
  let controller: CategoriesAdminController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesAdminController],
    }).compile();

    controller = module.get<CategoriesAdminController>(CategoriesAdminController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

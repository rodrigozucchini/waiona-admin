import { PartialType } from '@nestjs/mapped-types';
import { CreateProductAdminDto } from './create-product.admin.dto';

export class UpdateProductAdminDto extends PartialType(CreateProductAdminDto) {}

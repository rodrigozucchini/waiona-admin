import { ProductType } from '../../../common/enums/product-type.enum';
import { MarginResponseAdminDto } from '../../../pricing/margins/admin/dto/margin-response.admin.dto';
import { TaxResponseAdminDto } from '../../../pricing/taxes/admin/dto/tax-response.admin.dto';
import { ProductImageResponseAdminDto } from '../../images/admin/dto/product-image-response.admin.dto';

export class ProductResponseAdminDto {
  id: number;
  sku: string;
  name: string;
  description?: string;
  type: ProductType;
  basePrice: number;

  margin?: MarginResponseAdminDto;
  taxes: TaxResponseAdminDto[];
  images: ProductImageResponseAdminDto[];

  createdAt: Date;
  updatedAt: Date;
}

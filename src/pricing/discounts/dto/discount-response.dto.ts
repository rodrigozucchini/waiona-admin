export class DiscountResponseDto {
    id: number;
    value: number;
    isPercentage: boolean;
    discountType: {
      id: number;
      code: string;
      name: string;
    };
    createdAt: Date;
    updatedAt: Date;
  }
  
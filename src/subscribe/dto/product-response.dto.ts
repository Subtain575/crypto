import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
  @ApiProperty({ description: 'Product ID' })
  id: string;

  @ApiProperty({ description: 'Name of the product' })
  name: string;

  @ApiProperty({ description: 'Description of the product' })
  description: string;

  @ApiProperty({ description: 'Stripe Product ID' })
  stripeProductId: string;

  @ApiProperty({ description: 'Stripe Price ID' })
  stripePriceId: string;

  @ApiProperty({ description: 'Currency code' })
  currency: string;

  @ApiProperty({ description: 'Price amount' })
  amount: number;

  @ApiProperty({ description: 'Billing interval', enum: ['month', 'year'] })
  interval: 'month' | 'year';

  @ApiProperty({ description: 'Product metadata' })
  metadata: {
    type: string;
    discount_percentage?: number;
    original_monthly_price?: number;
  };

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ description: 'Name of the product' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Description of the product', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Currency code (e.g., USD)' })
  @IsString()
  currency: string;

  @ApiProperty({
    description: 'Price amount in smallest currency unit (e.g., cents)',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Billing interval', enum: ['month', 'year'] })
  @IsEnum(['month', 'year'])
  interval: 'month' | 'year';

  @ApiProperty({ description: 'Product metadata', required: false })
  @IsObject()
  @IsOptional()
  metadata?: {
    type: string;
    discount_percentage?: number;
    original_monthly_price?: number;
  };
}

import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ExecuteTradeDto {
  @ApiProperty({
    example: 'BTCUSDT',
    description: 'Trading pair symbol like BTCUSDT',
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    example: 0.5,
    description: 'Quantity of the asset to trade',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({
    example: 27000,
    description: 'Simulated price at which trade is executed',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image of the trade',
    required: false,
  })
  @IsOptional()
  image?: any;
}

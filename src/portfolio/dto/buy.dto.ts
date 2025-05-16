import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class BuyDto {
  @ApiProperty({
    description: 'The asset to buy',
    example: 'BTC',
  })
  @IsString()
  asset: string;

  @ApiProperty({
    description: 'The quantity of the asset to buy',
    example: 1,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'The price of the asset to buy',
    example: 1000,
  })
  @IsNumber()
  price: number;
}

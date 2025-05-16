import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SellDto {
  @ApiProperty({ example: 'BTC' })
  @IsString()
  asset: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  price: number;
}

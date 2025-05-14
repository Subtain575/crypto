// dto/trade.dto.ts
import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExecuteTradeDto {
  @ApiProperty({
    example: 'BTCUSDT',
    description: 'Trading pair symbol like BTCUSDT',
  })
  @IsString()
  symbol: string;

  @ApiProperty({ example: 0.5, description: 'Quantity of the asset to trade' })
  @IsNumber()
  quantity: number;
}

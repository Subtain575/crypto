import { ApiProperty } from '@nestjs/swagger';

export class CreateAnalyticsDto {
  @ApiProperty()
  totalTrades: number;

  @ApiProperty()
  wins: number;

  @ApiProperty()
  losses: number;

  @ApiProperty({ description: 'Win percentage (0 to 100)' })
  winRate: number;

  @ApiProperty({ description: 'Average trade size' })
  avgTradeSize: number;

  @ApiProperty({ description: 'Average profit or loss per trade' })
  avgProfitOrLoss: number;
}

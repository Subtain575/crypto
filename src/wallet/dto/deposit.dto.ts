import { IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DepositDto {
  @ApiProperty({
    description: 'Amount to deposit into the wallet',
    example: 1000,
  })
  @IsNumber()
  @Min(1)
  amount: number;
}

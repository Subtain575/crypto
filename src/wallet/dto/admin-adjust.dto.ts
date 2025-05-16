import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminAdjustDto {
  @ApiProperty({ example: 'userId12345' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  amount: number;
}

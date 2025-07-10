// create-payment-intent.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: '64fc96c52a...', description: 'User ID' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'test@example.com', description: 'User Email' })
  @IsEmail()
  email: string;
}

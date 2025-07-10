// create-payment-intent.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: '64fc96c52a...', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 'test@example.com', description: 'User Email' })
  email: string;
}

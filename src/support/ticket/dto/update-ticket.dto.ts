import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TicketStatus } from '../enum/ticket-status.enum';

export class UpdateTicketDto {
  @ApiPropertyOptional({
    enum: TicketStatus,
    description: 'Status of the ticket',
  })
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @ApiPropertyOptional({
    example: 'Your issue has been resolved.',
    description: 'Reply or message content',
  })
  @IsString()
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({
    example: 'userId123',
    description: 'User ID of the person replying',
  })
  @IsString()
  @IsOptional()
  userId?: string;
}

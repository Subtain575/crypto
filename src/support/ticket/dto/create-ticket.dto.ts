// src/ticket/dto/create-ticket.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'Login Issue', description: 'Subject of the ticket' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({
    example: 'I am unable to login to my account',
    description: 'Ticket message/details',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

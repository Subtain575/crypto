// src/reply/dto/create-reply.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Role } from '../../../auth/enums/role.enum';

export class CreateReplyDto {
  @ApiProperty({
    example: 'ticketId123',
    description: 'ID of the ticket being replied to',
  })
  @IsString()
  @IsNotEmpty()
  ticketId: string;

  @ApiProperty({
    example: 'userId123',
    description: 'ID of the user/admin replying',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    example: Role.USER,
    enum: Role,
    description: 'Role of the person replying',
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @ApiProperty({
    example: 'We are looking into your issue.',
    description: 'Reply message content',
  })
  @IsString()
  @IsNotEmpty()
  message: string;
}

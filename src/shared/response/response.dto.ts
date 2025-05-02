import { HttpStatus } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiProperty({ description: 'The message of the response' })
  message: string;

  @ApiProperty({ description: 'The status code of the response' })
  statusCode: number;

  @ApiProperty({ description: 'The data of the response' })
  data: T;

  constructor(data: T, status?: HttpStatus, message?: string) {
    this.statusCode = status ?? HttpStatus.OK;
    this.message = message ?? 'Successful';
    this.data = data;
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BuyCourseDto {
  @ApiProperty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsString()
  courseId: string;
}

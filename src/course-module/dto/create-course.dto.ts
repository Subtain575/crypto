// src/course/dto/create-course.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: ['beginner', 'intermediate', 'advanced'] })
  level: string;

  @ApiProperty({ type: [String] })
  videoUrls: string[];
}

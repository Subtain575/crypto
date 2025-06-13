import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ description: 'Title of the course' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Course description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Difficulty level of the course',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @IsString()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  level: string;

  @ApiProperty({
    description: 'List of video URLs for the course',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  videoUrls: string[];

  @ApiProperty({
    description: 'User ID who created the course',
    required: false,
  })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({
    description: 'Publish status of the course',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({
    description: 'Subscription required to access the course',
    enum: ['free', 'basic', 'premium'],
    default: 'free',
    required: false,
  })
  @IsOptional()
  @IsEnum(['free', 'basic', 'premium'])
  requiredSubscription?: string;

  @ApiProperty({
    description: 'Tags associated with the course',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Estimated duration in minutes',
    required: false,
    example: 90,
  })
  @IsOptional()
  @IsNumber()
  estimatedDuration?: number;
}

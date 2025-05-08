import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateCourseDto {
  @ApiProperty({ description: 'Title of the course' })
  title: string;

  @ApiProperty({ description: 'Course description', required: false })
  description?: string;

  @ApiProperty({
    description: 'Difficulty level of the course',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  level: string;

  @ApiProperty({
    description: 'List of video URLs for the course',
    type: [String],
  })
  videoUrls: string[];

  @ApiProperty({
    description: 'User ID who created the course',
    type: String,
    required: false,
  })
  createdBy?: Types.ObjectId;

  @ApiProperty({
    description: 'Publish status of the course',
    default: false,
    required: false,
  })
  isPublished?: boolean;

  @ApiProperty({
    description: 'Subscription required to access the course',
    enum: ['free', 'basic', 'premium'],
    default: 'free',
    required: false,
  })
  requiredSubscription?: string;

  @ApiProperty({
    description: 'Tags associated with the course',
    type: [String],
    required: false,
  })
  tags?: string[];

  @ApiProperty({
    description: 'Estimated duration in minutes',
    required: false,
    example: 90,
  })
  estimatedDuration?: number;
}

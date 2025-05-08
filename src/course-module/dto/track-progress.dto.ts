import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class TrackProgressDto {
  @ApiProperty({ description: 'User ID', type: String })
  user: Types.ObjectId;

  @ApiProperty({ description: 'Module ID', type: String })
  module: Types.ObjectId;

  @ApiProperty({
    description: 'Whether the module is completed',
    default: false,
  })
  completed: boolean;

  @ApiProperty({
    description: 'Watched duration in seconds',
    default: 0,
  })
  watchedDuration: number;

  @ApiProperty({
    description: 'The last time the user watched the module',
    type: String,
    format: 'date-time',
    required: false,
  })
  lastWatched?: Date;

  @ApiProperty({
    description: 'User notes for this module',
    required: false,
  })
  notes?: string;
}

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CourseProgressDocument = CourseProgress & Document;

@Schema({ timestamps: true })
export class CourseProgress {
  @ApiProperty({ description: 'User ID', type: String })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @ApiProperty({ description: 'Module ID', type: String })
  @Prop({ type: Types.ObjectId, ref: 'Module', required: true })
  module: Types.ObjectId;

  @ApiProperty({
    description: 'Whether the module is completed',
    default: false,
  })
  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @ApiProperty({ description: 'Watched duration in seconds', default: 0 })
  @Prop({ type: Number, default: 0 })
  watchedDuration: number;

  @ApiProperty({
    description: 'The last time the user watched the module',
    required: false,
  })
  @Prop({ type: Date })
  lastWatched?: Date;

  @ApiProperty({ description: 'User notes for this module', required: false })
  @Prop({ type: String })
  notes?: string;
}

export const CourseProgressSchema =
  SchemaFactory.createForClass(CourseProgress);

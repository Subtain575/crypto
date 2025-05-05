// src/course/schemas/course-progress.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourseProgressDocument = CourseProgress & Document;

@Schema({ timestamps: true })
export class CourseProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ type: Map, of: Boolean, default: {} })
  progress: Map<number, boolean>;

  @Prop({ type: Number, default: 0 })
  percentageCompleted: number;
}

export const CourseProgressSchema =
  SchemaFactory.createForClass(CourseProgress);

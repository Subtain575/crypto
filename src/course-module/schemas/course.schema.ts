// src/course/schemas/course.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  level: string;

  @Prop({ type: [String] })
  videoUrls: string[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);

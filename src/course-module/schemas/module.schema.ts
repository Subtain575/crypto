import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type ModuleDocument = Module & Document;

@Schema({ timestamps: true })
export class Module {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course' })
  courseId: Types.ObjectId;

  @Prop({ type: [String] })
  videoUrls: string[];

  @Prop({ type: Number })
  duration: number;
}

export const ModuleSchema = SchemaFactory.createForClass(Module);

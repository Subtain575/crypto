import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  // createdBy: mongoose.Schema.Types.ObjectId;

  @Prop({ required: true, type: String })
  createdBy: string;

  @Prop({ type: Boolean, default: false })
  isPublished: boolean;

  @Prop({ type: String, enum: ['free', 'basic', 'premium'], default: 'free' })
  requiredSubscription: string;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: Number })
  estimatedDuration: number;
}

export const CourseSchema = SchemaFactory.createForClass(Course);

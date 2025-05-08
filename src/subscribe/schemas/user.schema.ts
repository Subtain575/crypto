import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ default: 'free' })
  role: 'free' | 'pro' | 'premium' | 'admin';

  @Prop({ type: Types.ObjectId, ref: 'Subscription' })
  subscription?: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Exclude } from 'class-transformer';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: false })
  firstName: string;

  @Prop({ required: false })
  lastName: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Prop()
  lastLogin?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  referredBy?: Types.ObjectId;

  @Prop({ unique: true })
  referralCode?: string;

  @Prop({ default: 0 })
  rewardPoints: number;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ type: [{ permission: String }], default: [] })
  permissions: { permission: string }[];

  @Prop({ default: false })
  isGoogleSignup: boolean;

  @Prop({ default: 'local' }) // 'local' | 'google' | 'facebook' etc
  provider: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDetails = {
  sub: string;
  email: string;
  role: string;
};

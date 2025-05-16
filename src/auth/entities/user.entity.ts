import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Exclude } from 'class-transformer';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  referredBy?: Types.ObjectId;

  @Prop({ unique: true })
  referralCode?: string;

  @Prop({ default: 0 })
  rewardPoints: number;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ type: [{ permission: String }], default: [] })
  permissions: { permission: string }[];
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDetails = {
  sub: string;
  email: string;
  role: string;
};

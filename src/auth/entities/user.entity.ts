import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Exclude } from 'class-transformer';
import { UserRole } from '../roles.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: number;

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

  @Prop({ default: UserRole.User })
  role: string;

  @Prop()
  lastLogin?: Date;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  referredBy?: Types.ObjectId;

  @Prop({ unique: true })
  referralCode?: string;

  @Prop({ type: [{ permission: String }], default: [] })
  permissions: { permission: string }[];

  @Prop()
  department?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDetails = {
  sub: string;
  email: string;
  role: string;
};

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Exclude } from 'class-transformer';
import { UserRole } from '../roles.enum';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: number;

  @Prop()
  name: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  @Exclude({ toPlainOnly: true })
  password: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: UserRole.User })
  role: string;

  @Prop({ type: [{ permission: String }], default: [] })
  permissions: { permission: string }[];

  @Prop()
  department?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

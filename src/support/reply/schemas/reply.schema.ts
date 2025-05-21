// src/reply/schemas/reply.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Reply extends Document {
  @Prop({ required: true })
  ticketId: string;

  @Prop({ required: true })
  role: string; // 'user' or 'admin'

  @Prop({ required: true })
  message: string;
}

export const ReplySchema = SchemaFactory.createForClass(Reply);

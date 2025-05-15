import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TicketStatus } from '../enum/ticket-status.enum';

@Schema({ timestamps: true })
export class Ticket extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: String, enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Prop({ type: [Object], default: [] }) // Can enhance this with a separate reply schema
  replies: {
    userId: string;
    message: string;
    createdAt: Date;
  }[];
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);

// src/notifications/schemas/notification.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Notification extends Document {
  @ApiProperty({
    example: 'New Ticket Created',
    description: 'Notification title',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    example: 'TICKET_CREATED',
    description:
      'Type of notification (REGISTER, TICKET_CREATED, USER_DELETED)',
  })
  @Prop({ required: true })
  type: string;

  @ApiProperty({
    example: 'User with ID abc123 created a new support ticket.',
    description: 'Notification message content',
  })
  @Prop({ required: true })
  message: string;

  @ApiProperty({
    example: 'user123',
    description: 'User ID related to this notification',
    required: false,
  })
  @Prop()
  userId: string;

  @ApiProperty({
    example: 'ticket456',
    description: 'Ticket ID related to this notification',
    required: false,
  })
  @Prop()
  ticketId: string;

  @ApiProperty({
    example: false,
    description: 'Whether the notification has been read or not',
  })
  @Prop({ default: false })
  isRead: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the notification has been seen or not',
  })
  @Prop({ default: false })
  isSeen: boolean;

  @ApiProperty({
    example: '2025-06-20T14:11:51.613Z',
    description: 'Date of creation',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-06-20T14:11:51.613Z',
    description: 'Date of last update',
  })
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

export type NotificationDocument = Notification & Document;

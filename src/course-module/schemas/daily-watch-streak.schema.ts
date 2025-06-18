import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DailyWatchStreakDocument = DailyWatchStreak & Document;

@Schema({ timestamps: true })
export class DailyWatchStreak {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Number, default: 0 })
  count: number;

  @Prop({ type: Date, default: Date.now })
  lastWatchedDate: Date;
}

export const DailyWatchStreakSchema =
  SchemaFactory.createForClass(DailyWatchStreak);

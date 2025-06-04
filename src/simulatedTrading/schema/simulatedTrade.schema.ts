import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SimulatedTrade extends Document {
  @Prop({ required: true }) user: string;
  @Prop({ required: true }) symbol: string;
  @Prop({ required: true }) quantity: number;
  @Prop({ required: true }) price: number;
  @Prop({ required: true, enum: ['buy', 'sell'] }) type: 'buy' | 'sell';

  @Prop({ enum: ['win', 'loss'], default: null }) outcome?: 'win' | 'loss';

  @Prop() profitOrLoss: number;

  @Prop({ default: Date.now })
  timestamp: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const SimulatedTradeSchema =
  SchemaFactory.createForClass(SimulatedTrade);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SimulatedTrade extends Document {
  @Prop({ required: true }) user: string;
  @Prop({ required: true, unique: true }) symbol: string;
  @Prop({ required: true }) quantity: number;
  @Prop({ required: true }) price: number;
  @Prop({ required: true }) type: 'buy' | 'sell';

  @Prop() outcome: 'win' | 'loss';
  @Prop() profitOrLoss: number;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const SimulatedTradeSchema =
  SchemaFactory.createForClass(SimulatedTrade);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SimulatedTrade extends Document {
  @Prop({ required: true }) userId: string;
  @Prop({ required: true }) symbol: string;
  @Prop({ required: true }) quantity: number;
  @Prop({ required: true }) price: number;
  @Prop({ required: true }) type: 'buy' | 'sell';
}
export const SimulatedTradeSchema =
  SchemaFactory.createForClass(SimulatedTrade);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SimulatedPortfolio extends Document {
  @Prop({ required: true, unique: true, index: true }) userId: string;
  @Prop({ type: Map, of: Number, default: {} }) coins: Map<string, number>;

  @Prop({ default: 10000 }) usdtBalance: number; // default balance for simulation
}

export const SimulatedPortfolioSchema =
  SchemaFactory.createForClass(SimulatedPortfolio);

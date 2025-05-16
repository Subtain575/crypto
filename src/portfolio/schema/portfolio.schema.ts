import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Portfolio {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: mongoose.Schema.Types.ObjectId;

  @Prop() asset: string;

  @Prop() quantity: number;

  @Prop() averageBuyPrice: number;
}

export const PortfolioSchema = SchemaFactory.createForClass(Portfolio);

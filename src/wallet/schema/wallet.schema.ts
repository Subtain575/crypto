import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Wallet {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ default: 0 })
  balance: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],
  })
  transactions: mongoose.Types.ObjectId[];
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

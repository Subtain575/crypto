import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Transaction {
  @Prop({ enum: ['deposit', 'withdrawal', 'buy', 'sell'], required: true })
  type: string;

  @Prop({ required: true })
  amount: number;

  @Prop() asset?: string;

  @Prop() quantity?: number;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

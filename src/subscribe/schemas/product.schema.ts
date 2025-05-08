import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Product extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  stripeProductId: string;

  @Prop({ required: true })
  stripePriceId: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  interval: 'month' | 'year';

  @Prop({ type: Object })
  metadata: {
    type: string;
    discount_percentage?: number;
    original_monthly_price?: number;
  };
}

export const ProductSchema = SchemaFactory.createForClass(Product);

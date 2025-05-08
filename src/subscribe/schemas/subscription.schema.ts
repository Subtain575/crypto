import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Subscription extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  plan: 'pro' | 'premium';

  @Prop({ required: true })
  subscriptionId: string;

  @Prop({ required: true })
  status:
    | 'active'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired'
    | 'past_due'
    | 'trialing'
    | 'unpaid';

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  product: Types.ObjectId;

  @Prop()
  currentPeriodStart: Date;

  @Prop()
  currentPeriodEnd: Date;

  @Prop()
  cancelAtPeriodEnd: boolean;

  @Prop()
  canceledAt?: Date;

  @Prop({ type: Object })
  metadata?: {
    planType: string;
    [key: string]: any;
  };
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionController } from './subscribe.controller';
import { StripeService } from './stripe.service';
import { SubscribeService } from './subscribe.service';
import { User, UserSchema } from './schemas/user.schema';
import {
  Subscription,
  SubscriptionSchema,
} from './schemas/subscription.schema';
import { Product, ProductSchema } from './schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [StripeService, SubscribeService],
})
export class SubscribeModule {}

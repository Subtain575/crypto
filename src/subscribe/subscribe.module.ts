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
import { Course, CourseSchema } from '../course-module/schemas/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [SubscriptionController],
  providers: [StripeService, SubscribeService],
  exports: [StripeService],
})
export class SubscribeModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [MongooseModule.forFeature([])],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class SubscribeModule {}

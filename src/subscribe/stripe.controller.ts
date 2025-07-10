import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePaymentIntentDto } from './dto/stripe.dto';

@Controller('stripe')
@ApiTags('Stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create Stripe Payment Intent' })
  @ApiResponse({ status: 201, description: 'Payment sheet details returned.' })
  async createPaymentIntent(@Body() body: CreatePaymentIntentDto) {
    return this.stripeService.chargeRegistrationFee(body.userId, body.email);
  }
}

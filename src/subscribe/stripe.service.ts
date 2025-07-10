import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private readonly configService: ConfigService) {
    const key = this?.configService?.get<string>('STRIPE_SECRET_KEY');
    const secretKey = String(key);
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-04-30.basil',
    });
  }

  // stripe.service.ts
  async chargeRegistrationFee(userId: string, email: string) {
    // 1. Create Stripe customer if needed
    const customer = await this.stripe.customers.create({
      email,
      metadata: { userId },
    });

    // 2. Create a PaymentIntent for $20
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: 2000,
      currency: 'usd',
      customer: customer.id,
      automatic_payment_methods: { enabled: true },
      metadata: { userId },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      customerId: customer.id,
    };
  }
  // stripe.service.ts
  async verifyPayment(paymentIntentId: string): Promise<boolean> {
    const paymentIntent =
      await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === 'succeeded';
  }
}

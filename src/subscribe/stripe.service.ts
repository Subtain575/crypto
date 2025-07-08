import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from '../course-module/schemas/course.schema';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private configService: ConfigService,
    @InjectModel(Course.name) private readonly courseModel: Model<Course>,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error(
        'STRIPE_SECRET_KEY is not defined in environment variables',
      );
    }

    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-04-30.basil',
    });
  }

  async createProductAnnualUSD() {
    try {
      // Create the product for USD
      const product = await this.stripe.products.create({
        name: 'NorskGPT Chat - Yearly Business Plan (USD)',
        description: 'Yearly Business Chatbot Subscription with 10% Discount',
        metadata: {
          type: 'business_annual_usd',
          discount_percentage: '10',
        },
      });

      // Calculate annual price with 10% discount
      // Assuming monthly price is $25
      const monthlyPrice = 35; // USD
      const annualPrice = Math.round(monthlyPrice * 12 * 0.9); // 10% discount on yearly rate

      // Create the annual price
      const price = await this.stripe.prices.create({
        unit_amount: annualPrice * 100, // Convert to cents
        currency: 'usd',
        product: product.id,
        recurring: {
          interval: 'year', // Set as yearly subscription
        },
        metadata: {
          original_monthly_price: monthlyPrice,
          discount_percentage: 10,
        },
      });

      this.logger.log(`Annual USD Product created: ${JSON.stringify(product)}`);
      this.logger.log(`Annual USD Price created: ${JSON.stringify(price)}`);

      return {
        product,
        price,
      };
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown Stripe error';
      this.logger.error(
        `Error creating annual USD product or price: ${errorMsg}`,
      );
      throw error;
    }
  }

  private getPriceIdForPlan(plan: 'pro' | 'premium'): string {
    const priceId =
      plan === 'pro'
        ? this.configService.get<string>('STRIPE_PRO_PLAN_ID')
        : this.configService.get<string>('STRIPE_PREMIUM_PLAN_ID');

    this.logger.log(`Getting price ID for plan ${plan}: ${priceId}`);

    if (!priceId) {
      this.logger.error(`Price ID not configured for plan: ${plan}`);
      throw new Error(
        `Price ID not found for plan: ${plan}. Please check your environment variables.`,
      );
    }

    return priceId;
  }

  async createCheckoutSession(
    userId: string,
    email: string,
    plan: 'pro' | 'premium',
  ): Promise<string> {
    this.logger.log(
      `Creating Stripe checkout for user ${userId} with plan ${plan}`,
    );

    try {
      const priceId = this.getPriceIdForPlan(plan);
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');

      if (!frontendUrl) {
        throw new Error('FRONTEND_URL is not defined in environment variables');
      }

      this.logger.log(`Using price ID: ${priceId}`);

      const session = await this.stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        client_reference_id: userId,
        customer_email: email,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          metadata: {
            userId,
            planType: plan,
          },
        },
        success_url: `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/subscription/cancel`,
      });

      this.logger.log(`Stripe checkout session created: ${session.id}`);
      return session.url as string;
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown Stripe error';
      this.logger.error('Stripe checkout session creation failed', errorMsg);
      throw new Error(`Stripe error: ${errorMsg}`);
    }
  }

  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : 'Unknown Stripe error';
      this.logger.error(
        `Failed to retrieve Stripe session ${sessionId}`,
        errorMsg,
      );
      throw new Error(`Unable to retrieve session: ${errorMsg}`);
    }
  }

  parseWebhookEvent(bodyBuffer: Buffer, signature: string): Stripe.Event {
    console.log('bodyBuffer', bodyBuffer);
    console.log('signature', signature);
    try {
      const webhookSecret = this.configService.get<string>(
        'STRIPE_WEBHOOK_SECRET',
      );
      if (!webhookSecret) {
        throw new Error(
          'STRIPE_WEBHOOK_SECRET is not defined in environment variables',
        );
      }

      const event = this.stripe.webhooks.constructEvent(
        bodyBuffer,
        signature,
        webhookSecret,
      );
      console.log('event', event);

      this.logger.log(`Webhook event verified: ${event.type}`);
      return event;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error('Failed to verify webhook signature', msg);
      throw new Error(`Webhook verification failed: ${msg}`);
    }
  }
  async createCourseCheckoutSession(userId: string, courseId: string) {
    const course = await this.courseModel.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
            },
            unit_amount: course.price, // 2000 for $20
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://your-frontend.com/success?courseId=${courseId}`,
      cancel_url: `https://your-frontend.com/cancel`,
      metadata: {
        courseId,
        userId,
      },
    });

    return { url: session.url };
  }
}

import {
  Controller,
  Post,
  Req,
  Res,
  Headers,
  Body,
  RawBodyRequest,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StripeService } from './stripe.service';
import { SubscribeService } from './subscribe.service';
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Public } from './shared/decorators/public.decorator';
@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly subscribeService: SubscribeService,
  ) {}

  @Post('products/annual-usd')
  async createProductAnnualUSD() {
    try {
      const result = await this.stripeService.createProductAnnualUSD();
      return result;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: errorMsg,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('webhook')
  @Public()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request> & { rawBody: Buffer },
    @Res() res: Response,
    @Headers('stripe-signature') signature: string,
  ) {
    console.log('webhook event received');
    let event: Stripe.Event;
    console.log('signature', signature);

    try {
      event = this.stripeService.parseWebhookEvent(req.rawBody, signature);
      console.log('event', event);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown Webhook Error';
      return res.status(400).send(`Webhook Error: ${message}`);
    }

    try {
      await this.subscribeService.handleStripeEvent(event);
      return res.status(200).json({ received: true });
    } catch (err) {
      console.error(
        'Error handling Stripe event:',
        err instanceof Error ? err.message : err,
      );
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        email: { type: 'string', format: 'email' },
        plan: { type: 'string', enum: ['pro', 'premium'] },
      },
      required: ['userId', 'email', 'plan'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns Stripe checkout URL',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: 'https://checkout.stripe.com/c/pay/cs_test_...',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - invalid input' })
  @ApiResponse({ status: 500, description: 'Stripe API error' })
  @Post('create-checkout')
  async createCheckout(
    @Body() body: { userId: string; email: string; plan: 'pro' | 'premium' },
  ) {
    return this.stripeService.createCheckoutSession(
      body.userId,
      body.email,
      body.plan,
    );
  }
}

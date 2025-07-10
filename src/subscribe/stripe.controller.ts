import { Controller, Post, Body } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('customer')
  @ApiOperation({ summary: 'Create Stripe customer by email' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
      required: ['email'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Stripe customer created',
    schema: {
      example: {
        customerId: 'cus_1234567890abcdef',
      },
    },
  })
  async createCustomer(@Body('email') email: string) {
    const customerId = await this.stripeService.createCustomer(email);
    return { customerId };
  }

  @Post('payment-sheet')
  @ApiOperation({ summary: 'Create Payment Sheet (client secret)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        customerId: { type: 'string', example: 'cus_1234567890abcdef' },
        amount: { type: 'number', example: 2000 },
        courseId: { type: 'string', example: 'courseId123' },
        userId: { type: 'string', example: 'userId456' },
      },
      required: ['customerId', 'amount', 'courseId', 'userId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Returns Stripe Payment Sheet client secret',
    schema: {
      example: {
        paymentIntent: 'pi_12345_secret_abc123',
      },
    },
  })
  async paymentSheet(
    @Body()
    body: {
      customerId: string;
      amount: number;
      courseId: string;
      userId: string;
    },
  ) {
    return this.stripeService.createPaymentSheet(
      body.customerId,
      body.amount,
      body.courseId,
      body.userId,
    );
  }
}

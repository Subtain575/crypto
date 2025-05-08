import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './schemas/user.schema';
import { Subscription } from './schemas/subscription.schema';
import Stripe from 'stripe';

@Injectable()
export class SubscribeService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
  ) {}
  // todo: add a logger
  async handleStripeEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const plan = session.metadata?.plan;
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;

        if (userId && plan && subscriptionId) {
          await this.handleSuccessfulSubscription(
            userId,
            plan as 'pro' | 'premium',
            subscriptionId,
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        await this.updateSubscriptionStatus(
          subscription.id,
          subscription.status as
            | 'active'
            | 'canceled'
            | 'incomplete'
            | 'incomplete_expired'
            | 'past_due'
            | 'trialing'
            | 'unpaid',
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await this.markSubscriptionCancelled(subscription.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  async handleSuccessfulSubscription(
    userId: string,
    plan: 'pro' | 'premium',
    subscriptionId: string,
  ) {
    const subscription = await this.subscriptionModel.create({
      userId: new Types.ObjectId(userId),
      plan,
      subscriptionId,
      status: 'active',
    });

    // Update user role based on subscription
    await this.userModel.findByIdAndUpdate(userId, {
      role: plan,
      subscription: subscription._id,
    });
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status:
      | 'active'
      | 'canceled'
      | 'incomplete'
      | 'incomplete_expired'
      | 'past_due'
      | 'trialing'
      | 'unpaid',
  ) {
    const subscription = await this.subscriptionModel.findOneAndUpdate(
      { subscriptionId },
      { status },
      { new: true },
    );

    if (subscription) {
      // Update user role based on subscription status
      const newRole = status === 'active' ? subscription.plan : 'free';
      await this.userModel.findByIdAndUpdate(subscription.userId, {
        role: newRole,
      });
    }
  }

  async markSubscriptionCancelled(subscriptionId: string) {
    const subscription = await this.subscriptionModel.findOneAndUpdate(
      { subscriptionId },
      { status: 'canceled' },
      { new: true },
    );

    if (subscription) {
      // Reset user role to free when subscription is cancelled
      await this.userModel.findByIdAndUpdate(subscription.userId, {
        role: 'free',
      });
    }
  }
}

import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Wallet } from './schema/wallet.schema';
import { Transaction } from './schema/transaction.schema';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class WalletService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private configService: ConfigService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    this.stripe = new Stripe(stripeKey, {
      apiVersion: '2025-04-30.basil',
    });
  }

  async createWallet(userId: string) {
    const existing = await this.walletModel.findOne({ user: userId });
    if (existing) return existing;

    const wallet = new this.walletModel({
      user: userId,
      balance: 1000,
      transactions: [],
    });
    const savedWallet = await wallet.save();
    return savedWallet;
  }

  async deposit(userId: string, amount: number) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (amount <= 0) {
      throw new BadRequestException('Deposit amount must be greater than 0');
    }

    const wallet = await this.walletModel.findOne({ user: userId });
    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    // 💳 Step 1: Create Stripe PaymentIntent
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: 'usd',
      // payment_method: paymentMethodId,

      confirm: true,
      payment_method: 'pm_card_visa',
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never', // ✅ Prevent redirect-based methods
      },

      metadata: {
        userId: userId.toString(),
        purpose: 'wallet_deposit',
      },
    });

    // ✅ Step 2: Check if payment succeeded
    if (paymentIntent.status !== 'succeeded') {
      throw new BadRequestException('Payment failed');
    }

    wallet.balance += amount;

    const transaction = await this.transactionModel.create({
      type: 'deposit',
      amount,
      stripePaymentIntentId: paymentIntent.id, // optional for record
    });

    wallet.transactions.push(transaction._id);
    return wallet.save();
  }

  async getWallet(userId: string) {
    return this.walletModel.findOne({ user: userId });
  }

  async withdraw(userId: string, amount: number) {
    if (amount <= 0)
      throw new BadRequestException('Amount must be greater than 0');

    const wallet = await this.walletModel.findOne({ user: userId });
    if (!wallet || wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    wallet.balance -= amount;

    const transaction = await this.transactionModel.create({
      type: 'withdrawal',
      amount,
    });

    wallet.transactions.push(transaction._id);
    await wallet.save();

    return {
      message: 'Withdraw successful (mock)',
      newBalance: wallet.balance,
    };
  }

  async adminAdjustFunds(userId: string, amount: number) {
    const wallet = await this.walletModel.findOne({ user: userId });
    if (!wallet) throw new BadRequestException('Wallet not found');

    wallet.balance += amount;

    const transaction = await this.transactionModel.create({
      type: amount > 0 ? 'deposit' : 'withdrawal',
      amount: Math.abs(amount),
    });

    wallet.transactions.push(transaction._id);
    await wallet.save();

    return { message: 'Admin funds updated', balance: wallet.balance };
  }
}

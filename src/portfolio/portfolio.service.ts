import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Portfolio } from './schema/portfolio.schema';
import { Wallet } from '../wallet/schema/wallet.schema';
import { Transaction } from '../wallet/schema/transaction.schema';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectModel(Portfolio.name) private portfolioModel: Model<Portfolio>,
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async buyAsset(
    userId: string,
    asset: string,
    quantity: number,
    price: number,
  ) {
    const totalCost = quantity * price;
    const wallet = await this.walletModel.findOne({ user: userId });

    if (!wallet) {
      throw new BadRequestException('Wallet not found for user');
    }

    if (wallet.balance < totalCost) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    // Deduct balance
    wallet.balance -= totalCost;

    // Create transaction
    const transaction = await this.transactionModel.create({
      type: 'buy',
      amount: totalCost,
      asset,
      quantity,
    });

    wallet.transactions.push(transaction._id);
    await wallet.save();

    // Update or create portfolio
    let portfolio = await this.portfolioModel.findOne({ user: userId, asset });

    if (!portfolio) {
      portfolio = new this.portfolioModel({
        user: userId,
        asset,
        quantity,
        averageBuyPrice: price,
      });
    } else {
      const totalQuantity = portfolio.quantity + quantity;
      const totalCostBefore = portfolio.quantity * portfolio.averageBuyPrice;
      const newAvg = (totalCostBefore + totalCost) / totalQuantity;

      portfolio.quantity = totalQuantity;
      portfolio.averageBuyPrice = newAvg;
    }
    await portfolio.save();
    return {
      data: {
        asset,
        quantity,
        averageBuyPrice: price,
      },
    };
  }

  async getPortfolio(userId: string) {
    const portfolio = await this.portfolioModel
      .find({ user: userId })
      .sort({ createdAt: -1 });

    const wallet = await this.walletModel
      .findOne({ user: userId })
      .populate('transactions'); // Populate transaction history

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    return {
      portfolio,
      transactions: wallet.transactions,
      balance: wallet.balance,
    };
  }

  async sellAsset(
    userId: string,
    asset: string,
    quantity: number,
    price: number,
  ) {
    const portfolio = await this.portfolioModel.findOne({
      user: userId,
      asset,
    });

    if (!portfolio || portfolio.quantity < quantity) {
      throw new BadRequestException('Not enough asset quantity to sell');
    }

    const totalAmount = quantity * price;

    portfolio.quantity -= quantity;

    if (portfolio.quantity === 0) {
      await this.portfolioModel.deleteOne({ _id: portfolio._id });
    } else {
      await portfolio.save();
    }

    const wallet = await this.walletModel.findOne({ user: userId });
    if (!wallet) {
      throw new BadRequestException('Wallet not found for user');
    }
    wallet.balance += totalAmount;

    const transaction = await this.transactionModel.create({
      type: 'sell',
      amount: totalAmount,
      asset,
      quantity,
    });

    wallet.transactions.push(transaction._id);
    await wallet.save();

    return { message: 'Asset sold successfully', newBalance: wallet.balance };
  }
}

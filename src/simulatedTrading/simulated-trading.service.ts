import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SimulatedTrade } from './schema/simulatedTrade.schema';
import { SimulatedPortfolio } from './schema/simulated-portfolio.schema';

@Injectable()
export class SimulatedTradingService {
  constructor(
    @InjectModel(SimulatedTrade.name)
    private readonly tradeModel: Model<SimulatedTrade>,
    @InjectModel(SimulatedPortfolio.name)
    private readonly portfolioModel: Model<SimulatedPortfolio>,
  ) {}

  async buySimulated(
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
  ) {
    await this.tradeModel.create({
      user: userId,
      symbol,
      quantity,
      type: 'BUY',
      price,
      createdAt: new Date(),
    });

    return {
      data: {
        symbol,
        quantity,
        price,
        type: 'BUY',
      },
    };
  }

  async sellSimulated(
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
  ) {
    await this.tradeModel.create({
      user: userId,
      symbol,
      quantity,
      type: 'SELL',
      price,
      createdAt: new Date(),
    });

    return {
      data: {
        symbol,
        quantity,
        price,
        type: 'SELL',
      },
    };
  }

  async getUserCurrentHoldings(userId: string) {
    return this.tradeModel.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$symbol',
          totalBuy: {
            $sum: {
              $cond: [{ $eq: ['$type', 'BUY'] }, '$quantity', 0],
            },
          },
          totalSell: {
            $sum: {
              $cond: [{ $eq: ['$type', 'SELL'] }, '$quantity', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          symbol: '$_id',
          holding: { $subtract: ['$totalBuy', '$totalSell'] },
        },
      },
      {
        $match: {
          holding: { $gt: 0 },
        },
      },
      {
        $sort: { holding: -1 },
      },
    ]);
  }
}

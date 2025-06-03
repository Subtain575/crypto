import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SimulatedTrade } from './schema/simulatedTrade.schema';
import { SimulatedPortfolio } from './schema/simulated-portfolio.schema';

export interface HoldingResult {
  symbol: string;
  holding: number;
  price: number;
  type: 'BUY' | 'SELL';
}

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
      symbol,
      quantity,
      price,
      type: 'BUY',
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
      symbol,
      quantity,
      price,
      type: 'SELL',
    };
  }

  async getUserCurrentHoldings(userId: string): Promise<HoldingResult | null> {
    const holdings = await this.tradeModel.aggregate<HoldingResult>([
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
          lastBuy: {
            $last: {
              $cond: [{ $eq: ['$type', 'BUY'] }, '$$ROOT', null],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          symbol: '$_id',
          quantity: { $subtract: ['$totalBuy', '$totalSell'] },
          price: '$lastBuy.price',
          type: '$lastBuy.type',
        },
      },
      {
        $match: {
          quantity: { $gt: 0 },
        },
      },
      {
        $sort: { quantity: -1 },
      },
    ]);

    return holdings[0] || null;
  }
}

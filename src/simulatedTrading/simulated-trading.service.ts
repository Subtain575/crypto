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
    // Always create a new trade entry - no more updating existing ones
    const trade = await this.tradeModel.create({
      user: userId,
      symbol,
      quantity,
      type: 'BUY',
      price,
      createdAt: new Date(),
    });

    return {
      result: {
        symbol: trade.symbol,
        quantity: trade.quantity,
        price: trade.price,
        type: trade.type,
      },
    };
  }

  async sellSimulated(
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
  ) {
    const trade = await this.tradeModel.create({
      user: userId,
      symbol,
      quantity,
      type: 'SELL',
      price,
      createdAt: new Date(),
    });

    return {
      result: {
        symbol: trade.symbol,
        quantity: trade.quantity,
        price: trade.price,
        type: trade.type,
      },
    };
  }

  async getUserCurrentHoldings(userId: string): Promise<HoldingResult[]> {
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
          lastPrice: {
            $last: {
              $cond: [{ $eq: ['$type', 'BUY'] }, '$price', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          symbol: '$_id',
          holding: { $subtract: ['$totalBuy', '$totalSell'] },
          price: '$lastPrice',
          type: 'BUY' as const,
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

    return holdings;
  }

  // Optional: Get all trades for a user (to see individual buy/sell records)
  async getUserTradeHistory(userId: string) {
    const trades = await this.tradeModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return {
      status: 200,
      message: 'Success',
      data: {
        trades,
      },
    };
  }

  // Optional: Get holdings for a specific symbol
  async getSymbolHolding(userId: string, symbol: string) {
    type SymbolHolding = {
      symbol: string;
      quantity: number;
      price: number;
      type: 'BUY';
    };
    const holding = await this.tradeModel.aggregate<SymbolHolding>([
      { $match: { user: userId, symbol } },
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
          lastPrice: {
            $last: {
              $cond: [{ $eq: ['$type', 'BUY'] }, '$price', 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          symbol: '$_id',
          quantity: { $subtract: ['$totalBuy', '$totalSell'] },
          price: '$lastPrice',
          type: 'BUY' as const,
        },
      },
    ]);

    return {
      status: 200,
      message: 'Success',
      data: {
        holding: holding[0] || null,
      },
    };
  }
}

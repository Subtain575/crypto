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

    return { success: true, message: 'Simulated buy saved', type: 'BUY' };
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

    return { success: true, message: 'Simulated sell saved', type: 'SELL' };
  }

  async getUserTrades(userId: string) {
    return this.tradeModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .exec();
  }
}

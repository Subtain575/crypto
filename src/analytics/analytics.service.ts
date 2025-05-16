import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SimulatedTrade } from '../simulatedTrading/schema/simulatedTrade.schema';
import { Model } from 'mongoose';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(SimulatedTrade.name)
    private readonly tradeModel: Model<SimulatedTrade>,
  ) {}

  async getUserAnalytics(userId: string): Promise<CreateAnalyticsDto> {
    const trades = await this.tradeModel.find({ user: userId }).lean();

    const totalTrades = trades.length;
    const wins = trades.filter((t) => t.outcome === 'win').length;
    const losses = trades.filter((t) => t.outcome === 'loss').length;

    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    const avgTradeSize =
      totalTrades > 0
        ? trades.reduce((sum, t) => sum + t.quantity * t.price, 0) / totalTrades
        : 0;

    const avgProfitOrLoss =
      totalTrades > 0
        ? trades.reduce((sum, t) => sum + (t.profitOrLoss || 0), 0) /
          totalTrades
        : 0;

    return {
      totalTrades,
      wins,
      losses,
      winRate: +winRate.toFixed(2),
      avgTradeSize: +avgTradeSize.toFixed(2),
      avgProfitOrLoss: +avgProfitOrLoss.toFixed(2),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SimulatedTrade } from '../simulatedTrading/schema/simulatedTrade.schema';
import { Model } from 'mongoose';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { User } from '../auth/schema/user.schema';
import { Course } from '../course-module/schemas/course.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(SimulatedTrade.name)
    private readonly tradeModel: Model<SimulatedTrade>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<Course>,
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
  async getAppStats() {
    const totalUsers = await this.userModel.countDocuments();
    const premiumUsers = await this.userModel.countDocuments({
      isPremium: true,
    });
    const totalCourses = await this.courseModel.countDocuments();

    return {
      totalUsers,
      premiumUsers,
      totalCourses,
    };
  }
}

import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SimulatedTrade } from './schema/simulatedTrade.schema';
import { SimulatedPortfolio } from './schema/simulated-portfolio.schema';
import { Wallet } from '../wallet/schema/wallet.schema';
import { User } from '../auth/schema/user.schema';

interface MarketData {
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

interface BasicHolding {
  symbol: string;
  holding: number;
  price: number;
  type: 'BUY';
}

export interface HoldingResult extends MarketData {
  symbol: string;
  holding: number;
  price: number;
  type: 'BUY' | 'SELL';
  totalValue: number;
  profitLoss: number;
  image?: string | null;
}

interface TradeError extends Error {
  message: string;
  status?: number;
}

@Injectable()
export class SimulatedTradingService {
  constructor(
    @InjectModel(SimulatedTrade.name)
    private readonly tradeModel: Model<SimulatedTrade>,
    @InjectModel(SimulatedPortfolio.name)
    private readonly portfolioModel: Model<SimulatedPortfolio>,
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<Wallet>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) {}

  // Input validation helper
  private validateTradeInput(
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
  ) {
    if (!userId || !symbol || !quantity || !price) {
      throw new BadRequestException(
        'Missing required parameters: userId, symbol, quantity, and price are required',
      );
    }

    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    if (price <= 0) {
      throw new BadRequestException('Price must be greater than 0');
    }
  }

  async buySimulated(
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
    image?: string,
  ) {
    try {
      this.validateTradeInput(userId, symbol, quantity, price);

      const wallet = await this.walletModel.findOne({ user: userId });
      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }

      const totalCost = quantity * price;
      if (wallet.balance < totalCost) {
        throw new BadRequestException(
          'Insufficient wallet balance. Please add more balance.',
        );
      }

      wallet.balance -= totalCost;
      await wallet.save();

      const trade = await this.tradeModel.create({
        user: userId,
        symbol: symbol.toUpperCase(), // Ensure consistent symbol format
        quantity,
        type: 'buy',
        price,
        image: image || null,
        timestamp: new Date(),
      });

      // Check if trade was created successfully
      if (!trade) {
        throw new InternalServerErrorException('Failed to create trade record');
      }

      return {
        symbol: trade.symbol,
        quantity: trade.quantity,
        price: trade.price,
        type: trade.type,
        image: trade.image,
        timestamp: trade.timestamp,
      };
    } catch (error) {
      console.error('Error in buySimulated:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      const tradeError = error as TradeError;
      throw new InternalServerErrorException({
        status: 500,
        message: 'Internal server error',
        error: tradeError.message || 'Failed to execute buy order',
      });
    }
  }

  // 2. SELL API - Fixed with proper error handling
  async sellSimulated(
    userId: string,
    symbol: string,
    quantity: number,
    price: number,
  ) {
    try {
      // Validate input
      this.validateTradeInput(userId, symbol, quantity, price);

      // Check if user has sufficient holdings for sell order
      const currentHoldings = await this.getUserCurrentHoldings(userId);
      const holding = currentHoldings.data.find(
        (h) => h.symbol === symbol.toUpperCase(),
      );

      if (!holding || holding.holding < quantity) {
        throw new BadRequestException(
          `Insufficient holdings. You have ${holding?.holding || 0} ${symbol} but trying to sell ${quantity}`,
        );
      }

      // Create trade with error handling
      const trade = await this.tradeModel.create({
        user: userId,
        symbol: symbol.toUpperCase(), // Ensure consistent symbol format
        quantity,
        type: 'sell',
        price,
        timestamp: new Date(),
      });

      // Add money to wallet
      const wallet = await this.walletModel.findOne({ user: userId });
      if (!wallet) {
        throw new BadRequestException('Wallet not found');
      }
      wallet.balance += quantity * price;
      await wallet.save();

      // Check if trade was created successfully
      if (!trade) {
        throw new InternalServerErrorException('Failed to create trade record');
      }

      return {
        symbol: trade.symbol,
        quantity: trade.quantity,
        price: trade.price,
        type: trade.type,
        timestamp: trade.timestamp,
      };
    } catch (error) {
      console.error('Error in sellSimulated:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      const tradeError = error as TradeError;
      throw new InternalServerErrorException({
        status: 500,
        message: 'Internal server error',
        error: tradeError.message || 'Failed to execute sell order',
      });
    }
  }

  // 3. GET API - Enhanced with all market data and error handling
  async getUserCurrentHoldings(userId: string): Promise<{
    status: number;
    message: string;
    data: HoldingResult[] & { image?: string }[];
  }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const basicHoldings = await this.tradeModel.aggregate<BasicHolding>([
        { $match: { user: userId } },
        {
          $group: {
            _id: '$symbol',
            totalBuy: {
              $sum: {
                $cond: [{ $eq: ['$type', 'buy'] }, '$quantity', 0],
              },
            },
            totalSell: {
              $sum: {
                $cond: [{ $eq: ['$type', 'sell'] }, '$quantity', 0],
              },
            },
            avgPrice: {
              $avg: {
                $cond: [{ $eq: ['$type', 'buy'] }, '$price', null],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            symbol: '$_id',
            holding: { $subtract: ['$totalBuy', '$totalSell'] },
            price: '$avgPrice',
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

      if (!basicHoldings || basicHoldings.length === 0) {
        return {
          status: 200,
          message: 'No holdings found for user',
          data: [],
        };
      }

      const latestBuyTrades = await this.tradeModel
        .find({
          user: userId,
          type: 'buy',
          symbol: { $in: basicHoldings.map((h) => h.symbol) },
        })
        .sort({ timestamp: -1 })
        .lean();

      const imageMap = new Map<string, string>();
      for (const trade of latestBuyTrades) {
        if (!imageMap.has(trade.symbol) && trade.image) {
          imageMap.set(trade.symbol, trade.image);
        }
      }

      const enhancedHoldings: (HoldingResult & { image?: string })[] =
        basicHoldings
          .map((holding) => {
            if (!holding || !holding.symbol) {
              return null;
            }

            const marketData = this.generateMarketData(holding.symbol);
            const currentPrice = parseFloat(marketData.lastPrice);
            const totalValue = holding.holding * currentPrice;
            const profitLoss = totalValue - holding.holding * holding.price;

            const result: HoldingResult = {
              symbol: holding.symbol,
              holding: holding.holding,
              price: holding.price || 0,
              type: holding.type,
              ...marketData,
              totalValue: parseFloat(totalValue.toFixed(2)),
              profitLoss: parseFloat(profitLoss.toFixed(2)),
              image: imageMap.get(holding.symbol) || null,
            };
            return result;
          })
          .filter(
            (holding): holding is HoldingResult & { image?: string } =>
              holding !== null,
          );

      return {
        status: 200,
        message: 'Holdings retrieved successfully',
        data: enhancedHoldings,
      };
    } catch (error) {
      console.error('Error in getUserCurrentHoldings:', error);

      const tradeError = error as TradeError;
      throw new InternalServerErrorException({
        status: 500,
        message: 'Internal server error',
        error: tradeError.message || 'Failed to retrieve holdings',
      });
    }
  }

  private generateMarketData(symbol: string): MarketData {
    try {
      if (!symbol) {
        throw new Error('Symbol is required for market data generation');
      }

      const basePrice = Math.random() * 100 + 10;
      const change = (Math.random() - 0.5) * 5;
      const changePercent = (change / basePrice) * 100;
      const volume = Math.random() * 50000 + 10000;
      const now = Date.now();

      return {
        priceChange: change.toFixed(8),
        priceChangePercent: changePercent.toFixed(3),
        weightedAvgPrice: (basePrice * 0.995).toFixed(8),
        prevClosePrice: (basePrice - change).toFixed(8),
        lastPrice: basePrice.toFixed(8),
        lastQty: (Math.random() * 10 + 1).toFixed(8),
        bidPrice: (basePrice * 0.999).toFixed(8),
        bidQty: (Math.random() * 50 + 10).toFixed(8),
        askPrice: (basePrice * 1.001).toFixed(8),
        askQty: (Math.random() * 50 + 10).toFixed(8),
        openPrice: (basePrice * 0.98).toFixed(8),
        highPrice: (basePrice * 1.05).toFixed(8),
        lowPrice: (basePrice * 0.95).toFixed(8),
        volume: volume.toFixed(8),
        quoteVolume: (volume * basePrice).toFixed(8),
        openTime: now - 24 * 60 * 60 * 1000,
        closeTime: now,
        firstId: Math.floor(Math.random() * 1000000000),
        lastId: Math.floor(Math.random() * 1000000000),
        count: Math.floor(Math.random() * 100000) + 10000,
      };
    } catch (error) {
      console.error('Error generating market data:', error);
      return {
        priceChange: '0.00000000',
        priceChangePercent: '0.000',
        weightedAvgPrice: '50.00000000',
        prevClosePrice: '50.00000000',
        lastPrice: '50.00000000',
        lastQty: '1.00000000',
        bidPrice: '49.95000000',
        bidQty: '10.00000000',
        askPrice: '50.05000000',
        askQty: '10.00000000',
        openPrice: '49.00000000',
        highPrice: '52.50000000',
        lowPrice: '47.50000000',
        volume: '10000.00000000',
        quoteVolume: '500000.00000000',
        openTime: Date.now() - 24 * 60 * 60 * 1000,
        closeTime: Date.now(),
        firstId: 1000000,
        lastId: 1000001,
        count: 10000,
      };
    }
  }
  async getUserTradeHistory(userId: string): Promise<{
    status: number;
    message: string;
    data: any[];
    referral: {
      referralCode: string | undefined;
      rewardPoints: number;
      referredBy: any;
    } | null;
  }> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const user = await this.userModel
        .findById(userId)
        .populate('referredBy', 'firstName lastName email referralCode')
        .populate('referredUsers', 'firstName lastName email referralCode')
        .select('referralCode rewardPoints referredBy referredUsers');

      const referralData = user
        ? {
            referralCode: user.referralCode,
            rewardPoints: user.rewardPoints,
            referredBy: user.referredBy || null,
            referredUsers: user.referredUsers || [],
          }
        : null;

      const trades = await this.tradeModel
        .find({ user: userId })
        .sort({ timestamp: -1 }) // latest first
        .lean();

      if (!trades || trades.length === 0) {
        return {
          status: 200,
          message: 'No trade history found for this user',
          data: [],
          referral: referralData,
        };
      }
      const history = trades.map((trade) => ({
        symbol: trade.symbol,
        quantity: trade.quantity,
        price: trade.price,
        type: trade.type,
        timestamp: trade.timestamp,
        date: new Date(trade.timestamp).toLocaleDateString(),
        time: new Date(trade.timestamp).toLocaleTimeString(),
      }));

      return {
        status: 200,
        message: 'Trade history retrieved successfully',
        data: history,
        referral: referralData,
      };
    } catch (error) {
      console.error('Error in getUserTradeHistory:', error);

      const tradeError = error as TradeError;
      throw new InternalServerErrorException({
        status: 500,
        message: 'Internal server error',
        error: tradeError.message || 'Failed to retrieve trade history',
      });
    }
  }
}

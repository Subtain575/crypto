import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SimulatedTrade } from './schema/simulatedTrade.schema';
import { SimulatedPortfolio } from './schema/simulated-portfolio.schema';
import axios from 'axios';
import { createHmac } from 'crypto';

export interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

interface BinanceAccountResponse {
  balances: BinanceBalance[];
}

// Define an interface for Axios error responses
interface AxiosErrorResponse {
  response?: {
    data?: Record<string, unknown>;
  };
  message?: string;
}

interface BinanceOrderResponse {
  fills: {
    price: string;
    qty: string;
    commission: string;
    commissionAsset: string;
  }[];
  [key: string]: any;
}

interface OrderResult {
  success: boolean;
  side: 'BUY' | 'SELL';
  fills: BinanceOrderResponse['fills'];
  data: any;
}

@Injectable()
export class SimulatedTradingService {
  private readonly BINANCE_URL =
    process.env.BINANCE_BASE_URL || 'https://api.binance.com';

  constructor(
    @InjectModel(SimulatedTrade.name) private tradeModel: Model<SimulatedTrade>,
    @InjectModel(SimulatedPortfolio.name)
    private portfolioModel: Model<SimulatedPortfolio>,
  ) {}

  async getRealMarketPrice(symbol: string): Promise<number> {
    try {
      console.log('Fetching from Binance REST API:', symbol);
      const response = await axios.get<{ price: string }>(
        `${this.BINANCE_URL}/api/v3/ticker/price?symbol=${symbol}`,
      );
      return parseFloat(response.data.price);
    } catch (err) {
      console.error(
        '❌ Error fetching price:',
        err instanceof Error ? err.message : String(err),
      );
      throw new Error('Binance API timeout');
    }
  }

  async buyOnBinance(userId: string, symbol: string, quantity: number) {
    const result = await this.placeMarketOrder(symbol, quantity, 'BUY');

    const price = parseFloat(result.fills[0]?.price || '0');

    await this.tradeModel.create({
      user: userId,
      symbol,
      quantity,
      type: 'BUY',
      price,
      createdAt: new Date(),
    });

    return result;
  }

  async sellOnBinance(userId: string, symbol: string, quantity: number) {
    const result = await this.placeMarketOrder(symbol, quantity, 'SELL');

    const price = parseFloat(result.fills[0]?.price || '0');

    await this.tradeModel.create({
      user: userId,
      symbol,
      quantity,
      type: 'SELL',
      price,
      createdAt: new Date(),
    });

    return result;
  }

  // Updated method with proper return type and error handling
  private async placeMarketOrder(
    symbol: string,
    quantity: number,
    side: 'BUY' | 'SELL',
  ): Promise<OrderResult> {
    try {
      const timestamp = Date.now();
      const type = 'MARKET';

      const queryParams = new URLSearchParams({
        symbol: symbol.toUpperCase(),
        side,
        type,
        timestamp: timestamp.toString(),
      });

      if (side === 'BUY') {
        queryParams.append('quoteOrderQty', quantity.toString()); // Spend X USDT
      } else {
        queryParams.append('quantity', quantity.toString()); // Sell X coins
      }

      // Make sure the API secret exists
      if (!process.env.BINANCE_API_SECRET) {
        throw new Error(
          'BINANCE_API_SECRET is not defined in environment variables',
        );
      }

      const signature = createHmac('sha256', process.env.BINANCE_API_SECRET)
        .update(queryParams.toString())
        .digest('hex');

      queryParams.append('signature', signature);

      // Make sure the API key exists
      if (!process.env.BINANCE_API_KEY) {
        throw new Error(
          'BINANCE_API_KEY is not defined in environment variables',
        );
      }

      const response = await axios.post<BinanceOrderResponse>(
        `${this.BINANCE_URL}/api/v3/order?${queryParams.toString()}`,
        null,
        {
          headers: {
            'X-MBX-APIKEY': process.env.BINANCE_API_KEY,
          },
        },
      );

      console.log('Binance order response:', response.data);

      // The fixed line - properly using optional chaining and nullish coalescing
      // This ensures we always have an array, even if response.data is null/undefined or doesn't have fills
      const fills = response.data?.fills ?? [];

      return {
        success: true,
        side,
        fills,
        data: response.data,
      };
    } catch (error) {
      const axiosError = error as Error & AxiosErrorResponse;
      const errorData = axiosError.response?.data;
      const errorMsgObj = errorData?.msg;
      const errorMsg =
        typeof errorMsgObj === 'string'
          ? errorMsgObj
          : axiosError.message
            ? axiosError.message
            : String(error);

      console.error(
        `${side} order failed:`,
        errorData || (axiosError.message ? axiosError.message : String(error)),
      );

      throw new InternalServerErrorException(`${side} failed: ${errorMsg}`);
    }
  }

  async getRealPortfolio(): Promise<BinanceBalance[]> {
    try {
      const timestamp = Date.now();
      const query = `timestamp=${timestamp}`;

      // Check if API secret is defined
      if (!process.env.BINANCE_API_SECRET) {
        throw new Error('BINANCE_API_SECRET is not defined');
      }

      const signature = createHmac('sha256', process.env.BINANCE_API_SECRET)
        .update(query)
        .digest('hex');

      // Check if API key is defined
      if (!process.env.BINANCE_API_KEY) {
        throw new Error('BINANCE_API_KEY is not defined');
      }

      const response = await axios.get<BinanceAccountResponse>(
        `https://testnet.binance.vision/api/v3/account?${query}&signature=${signature}`,
        {
          headers: {
            'X-MBX-APIKEY': process.env.BINANCE_API_KEY,
          },
          timeout: 5000,
        },
      );

      // Avoid logging sensitive information
      console.log(
        'Using BINANCE_API_KEY:',
        process.env.BINANCE_API_KEY ? '[REDACTED]' : 'undefined',
      );
      console.log(
        'Using BINANCE_API_SECRET:',
        process.env.BINANCE_API_SECRET ? '[REDACTED]' : 'undefined',
      );

      return response.data.balances;
    } catch (err) {
      console.error(
        '❌ Error fetching real portfolio:',
        err instanceof Error ? err.message : String(err),
      );
      throw new Error('Failed to fetch portfolio from Binance');
    }
  }

  async getFuturesTradeHistory(symbol: string): Promise<any[]> {
    try {
      const timestamp = Date.now();

      // Make sure symbol is in correct format (e.g., BTCUSDT)
      const formattedSymbol = symbol.toUpperCase();

      // Create the query string with correct parameters
      const query = `symbol=${formattedSymbol}&limit=50&timestamp=${timestamp}`;

      // Check if API secret is defined
      if (!process.env.BINANCE_API_SECRET) {
        throw new Error('BINANCE_API_SECRET is not defined');
      }

      const signature = createHmac('sha256', process.env.BINANCE_API_SECRET)
        .update(query)
        .digest('hex');

      // Check if API key is defined
      if (!process.env.BINANCE_API_KEY) {
        throw new Error('BINANCE_API_KEY is not defined');
      }

      // Updated URL with explicit HTTPS
      const url = `https://testnet.binance.vision/api/v3/myTrades?${query}&signature=${signature}`;

      const response = await axios.get(url, {
        headers: {
          'X-MBX-APIKEY': process.env.BINANCE_API_KEY,
        },
        timeout: 5000,
      });

      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      const axiosError = error as Error & AxiosErrorResponse;
      const responseData = axiosError.response?.data;

      console.error(
        'Binance Futures API Error:',
        responseData ||
          (axiosError.message ? axiosError.message : String(error)),
      );

      // Check for specific Binance error codes
      if (responseData?.code) {
        const errorCode = responseData.code;
        const errorMsgObj = responseData.msg;
        const errorMsg = typeof errorMsgObj === 'string' ? errorMsgObj : '';

        if (errorCode === -2015) {
          throw new InternalServerErrorException(
            `API authentication error: ${errorMsg}. Please ensure your API key has futures trading permissions.`,
          );
        }
      }

      throw new InternalServerErrorException(
        'Failed to fetch futures trade history from Binance',
      );
    }
  }
}

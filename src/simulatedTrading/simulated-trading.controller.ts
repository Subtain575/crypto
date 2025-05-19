import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  NotFoundException,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SimulatedTradingService } from './simulated-trading.service';
import { ExecuteTradeDto } from './dto/trade.dto';
import { BinanceBalance } from './simulated-trading.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface OrderResult {
  success: boolean;
  side: 'BUY' | 'SELL';
  fills: Array<{
    price: string;
    qty: string;
    commission: string;
    commissionAsset: string;
  }>;
  data: any;
}

export interface RequestWithUser extends Request {
  user: {
    sub: string;
    email?: string;
    // Add other user fields as needed
  };
}

@ApiTags('Simulated Trading')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('sim-trade')
export class SimulatedTradingController {
  constructor(private readonly service: SimulatedTradingService) {}

  @Get('market-price')
  @ApiOperation({ summary: 'Get real-time market price for a symbol' })
  @ApiQuery({
    name: 'symbol',
    required: true,
    description: 'Trading pair symbol (e.g., BTCUSDT)',
  })
  @ApiResponse({
    status: 200,
    description: 'Current market price retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Symbol not found or price unavailable',
  })
  async getPrice(@Query('symbol') symbol: string) {
    try {
      const price = await this.service.getRealMarketPrice(symbol);
      return { symbol, price };
    } catch (err) {
      console.error(
        'Error fetching price:',
        err instanceof Error ? err.message : String(err),
      );
      throw new NotFoundException('Price not found for symbol: ' + symbol);
    }
  }

  @Post('buy')
  @ApiOperation({ summary: 'Execute a buy order' })
  @ApiResponse({ status: 201, description: 'Buy order executed successfully' })
  async buy(
    @Body() dto: ExecuteTradeDto,
    @Req() req: RequestWithUser,
  ): Promise<OrderResult> {
    return this.service.buyOnBinance(req.user.sub, dto.symbol, dto.quantity);
  }

  @Post('sell')
  @ApiOperation({ summary: 'Execute a sell order' })
  @ApiBody({ type: ExecuteTradeDto })
  @ApiResponse({ status: 201, description: 'Sell order executed successfully' })
  async sell(
    @Body() dto: ExecuteTradeDto,
    @Req() req: RequestWithUser,
  ): Promise<OrderResult> {
    return this.service.sellOnBinance(req.user.sub, dto.symbol, dto.quantity);
  }

  @Get('user-trades')
  async getMyTrades(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const trades = await this.service.getUserTrades(userId);
    return {
      success: true,
      count: trades.length,
      data: trades,
    };
  }

  @Get('portfolio')
  @ApiOperation({ summary: 'Get current portfolio balances' })
  @ApiResponse({
    status: 200,
    description: 'Portfolio balances retrieved successfully',
  })
  async getPortfolio(): Promise<BinanceBalance[]> {
    return this.service.getRealPortfolio();
  }

  @Get('trade-history')
  @ApiOperation({ summary: 'Get futures trade history for BTCUSDT' })
  @ApiResponse({
    status: 200,
    description: 'Trade history retrieved successfully',
  })
  async history() {
    return this.service.getFuturesTradeHistory('BTCUSDT');
  }
}

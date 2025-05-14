import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { SimulatedTradingService } from './simulated-trading.service';
import { ExecuteTradeDto } from './dto/trade.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { BinanceBalance } from './simulated-trading.service';

@ApiTags('Simulated Trading')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('sim-trade')
export class SimulatedTradingController {
  constructor(private readonly service: SimulatedTradingService) {}

  @Get('market-price')
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
  @ApiBody({ type: ExecuteTradeDto })
  async buy(@Body() dto: ExecuteTradeDto) {
    return this.service.buyOnBinance(dto.symbol, dto.quantity);
  }

  @Post('sell')
  @ApiBody({ type: ExecuteTradeDto })
  async sell(@Body() dto: ExecuteTradeDto) {
    return this.service.sellOnBinance(dto.symbol, dto.quantity);
  }

  @Get('portfolio')
  async getPortfolio(): Promise<BinanceBalance[]> {
    return this.service.getRealPortfolio();
  }

  @Get('trade-history')
  async history() {
    return this.service.getFuturesTradeHistory('BTCUSDT');
  }
}

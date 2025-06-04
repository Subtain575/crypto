import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { SimulatedTradingService } from './simulated-trading.service';
import { ApiOperation, ApiBody, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ExecuteTradeDto } from './dto/trade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user?: {
    sub?: string;
    email?: string;
    role?: string;
  };
}

@ApiTags('Simulated Trading')
@Controller('api/trading')
export class SimulatedTradingController {
  constructor(
    private readonly simulatedTradingService: SimulatedTradingService,
  ) {}

  // 1. BUY API
  @Post('buy')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Simulate a Buy Order' })
  @ApiBody({ type: ExecuteTradeDto })
  async buyStock(
    @Body()
    body: {
      symbol: string;
      quantity: number;
      price: number;
    },
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User ID not found in token');

    return this.simulatedTradingService.buySimulated(
      userId,
      body.symbol.toUpperCase(),
      body.quantity,
      body.price,
    );
  }

  // 2. SELL API
  @Post('sell')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Simulate a Sell Order' })
  @ApiBody({ type: ExecuteTradeDto })
  async sellStock(
    @Body()
    body: {
      symbol: string;
      quantity: number;
      price: number;
    },
    @Request() req: RequestWithUser,
  ) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User ID not found in token');

    return this.simulatedTradingService.sellSimulated(
      userId,
      body.symbol.toUpperCase(),
      body.quantity,
      body.price,
    );
  }

  // 3. GET API - Yahan sara enhanced data milega
  @Get('holdings')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Get user's current simulated holdings with market data",
  })
  async getHoldings(@Request() req: RequestWithUser) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User ID not found in token');
    return this.simulatedTradingService.getUserCurrentHoldings(userId);
  }

  @Get('history')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Get user's complete simulated trade history (buy/sell)",
  })
  async getTradeHistory(@Request() req: RequestWithUser) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedException('User ID not found in token');
    return this.simulatedTradingService.getUserTradeHistory(userId);
  }
}

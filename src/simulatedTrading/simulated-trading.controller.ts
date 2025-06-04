import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { SimulatedTradingService } from './simulated-trading.service';
import { ApiOperation, ApiBody, ApiTags } from '@nestjs/swagger';
import { ExecuteTradeDto } from './dto/trade.dto';

interface RequestWithUser extends Request {
  user?: {
    id: string;
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
    const userId = req.user?.id || 'demo-user';

    return this.simulatedTradingService.buySimulated(
      userId,
      body.symbol.toUpperCase(),
      body.quantity,
      body.price,
    );
  }

  // 2. SELL API
  @Post('sell')
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
    const userId = req.user?.id || 'demo-user';

    return this.simulatedTradingService.sellSimulated(
      userId,
      body.symbol.toUpperCase(),
      body.quantity,
      body.price,
    );
  }

  // 3. GET API - Yahan sara enhanced data milega
  @Get('holdings')
  @ApiOperation({
    summary: "Get user's current simulated holdings with market data",
  })
  async getHoldings(@Request() req: RequestWithUser) {
    const userId = req.user?.id || 'demo-user';

    return this.simulatedTradingService.getUserCurrentHoldings(userId);
  }
}

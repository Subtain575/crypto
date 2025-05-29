import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SimulatedTradingService } from './simulated-trading.service';
import { ExecuteTradeDto } from './dto/trade.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    sub: string;
    email?: string;
  };
}

@ApiTags('Simulated Trading')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('sim-trade')
export class SimulatedTradingController {
  constructor(private readonly service: SimulatedTradingService) {}

  @Post('buy')
  @ApiOperation({ summary: 'Simulate a buy trade' })
  @ApiResponse({
    status: 201,
    description: 'Simulated buy executed successfully',
  })
  async buy(@Body() dto: ExecuteTradeDto, @Req() req: RequestWithUser) {
    return this.service.buySimulated(
      req.user.sub,
      dto.symbol,
      dto.quantity,
      dto.price,
    );
  }

  @Post('sell')
  @ApiOperation({ summary: 'Simulate a sell trade' })
  @ApiBody({ type: ExecuteTradeDto })
  @ApiResponse({
    status: 201,
    description: 'Simulated sell executed successfully',
  })
  async sell(@Body() dto: ExecuteTradeDto, @Req() req: RequestWithUser) {
    return this.service.sellSimulated(
      req.user.sub,
      dto.symbol,
      dto.quantity,
      dto.price,
    );
  }

  @Get('user-trades')
  @ApiOperation({ summary: 'Get all simulated trades of the logged-in user' })
  async getMyTrades(@Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const trades = await this.service.getUserTrades(userId);
    return {
      success: true,
      count: trades.length,
      data: trades,
    };
  }
}

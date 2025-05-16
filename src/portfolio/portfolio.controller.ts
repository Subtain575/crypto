import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { BuyDto } from './dto/buy.dto';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { SellDto } from './dto/sell.dto';

interface RequestWithUser extends Request {
  user: {
    _id: string;
  };
}

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post('buy')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Buy asset' })
  @ApiBody({ type: BuyDto })
  buy(@Body() dto: BuyDto, @Req() req: RequestWithUser) {
    return this.portfolioService.buyAsset(
      req.user._id,
      dto.asset,
      dto.quantity,
      dto.price,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user portfolio' })
  getPortfolio(@Req() req: RequestWithUser) {
    return this.portfolioService.getPortfolio(req.user._id);
  }

  @Post('sell')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sell asset' })
  @ApiBody({ type: SellDto })
  sell(@Body() dto: SellDto, @Req() req: RequestWithUser) {
    return this.portfolioService.sellAsset(
      req.user._id,
      dto.asset,
      dto.quantity,
      dto.price,
    );
  }
}

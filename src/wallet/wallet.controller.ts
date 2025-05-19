import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { WithdrawDto } from './dto/withdraw.dto';
import { AdminAdjustDto } from './dto/admin-adjust.dto';

interface RequestWithUser extends Request {
  user: {
    _id: string;
    sub: string;
  };
}

@ApiTags('Wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit amount to wallet' })
  @ApiBody({ type: DepositDto })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  deposit(@Body() depositDto: DepositDto, @Req() req: RequestWithUser) {
    const userId = req.user?.sub;
    const amount = depositDto.amount;
    if (!userId) throw new BadRequestException('User not authenticated');

    return this.walletService.deposit(userId, amount);
  }

  @Get()
  @ApiOperation({ summary: 'Get user wallet' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  getWallet(@Req() req: RequestWithUser) {
    return this.walletService.getWallet(req.user._id);
  }

  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Withdraw from wallet (mock)' })
  @ApiBody({ type: WithdrawDto })
  withdraw(@Body() dto: WithdrawDto, @Req() req: RequestWithUser) {
    return this.walletService.withdraw(req.user._id, dto.amount);
  }

  @Post('admin-adjust')
  @UseGuards(JwtAuthGuard) // make sure admin is verified in the guard or decorator
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Admin adjust user funds' })
  @ApiBody({ type: AdminAdjustDto })
  adminAdjust(@Body() dto: AdminAdjustDto) {
    return this.walletService.adminAdjustFunds(dto.userId, dto.amount);
  }
}

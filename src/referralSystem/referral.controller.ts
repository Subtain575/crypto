import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CreateUserWithReferralDto,
  ApplyReferralDto,
} from './dto/referral.dto';
import { RequestWithUser } from '../simulatedTrading/simulated-trading.controller';

@ApiTags('Referral')
@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Post('generate/:userId')
  @ApiOperation({ summary: 'Generate referral code for a user' })
  @ApiResponse({ status: 200, description: 'Referral code generated' })
  async generate(@Param('userId') userId: string) {
    return this.referralService.generateReferralCode(userId);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register with optional referral code' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation or referral code error',
  })
  async registerWithReferral(@Body() dto: CreateUserWithReferralDto) {
    return this.referralService.registerWithReferral(dto);
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply referral code' })
  @ApiResponse({ status: 200, description: 'Referral applied successfully' })
  async applyReferralCode(
    @Req() req: RequestWithUser,
    @Body() dto: ApplyReferralDto,
  ) {
    const userId = req.user.sub; // from JWT token payload
    const { referralCode } = dto;

    if (!referralCode) {
      throw new BadRequestException('Referral code is required');
    }

    // Call service method to apply referral
    const result = await this.referralService.applyReferral(
      userId,
      referralCode,
    );
    return {
      message: 'Referral applied successfully',
      ...result,
    };
  }

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get referral stats' })
  @ApiResponse({ status: 200, description: 'Returns number of referred users' })
  async stats(@Param('userId') userId: string) {
    return this.referralService.getReferralStats(userId);
  }
}

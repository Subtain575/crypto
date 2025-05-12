import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserWithReferralDto } from './dto/referral.dto';

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

  @Get('stats/:userId')
  @ApiOperation({ summary: 'Get referral stats' })
  @ApiResponse({ status: 200, description: 'Returns number of referred users' })
  async stats(@Param('userId') userId: string) {
    return this.referralService.getReferralStats(userId);
  }
}

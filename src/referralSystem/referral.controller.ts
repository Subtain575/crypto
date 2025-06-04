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
  UseGuards,
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  CreateUserWithReferralDto,
  ApplyReferralDto,
} from './dto/referral.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserDetails } from '../auth/schema/user.schema';

interface RequestWithUserDetails extends Request {
  user: UserDetails;
}

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
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Apply referral code' })
  @ApiResponse({ status: 200, description: 'Referral applied successfully' })
  async applyReferralCode(
    @Req() req: RequestWithUserDetails,
    @Body() dto: ApplyReferralDto,
  ) {
    const userId = req.user.sub;
    const { referralCode } = dto;

    if (!referralCode) {
      throw new BadRequestException('Referral code is required');
    }

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

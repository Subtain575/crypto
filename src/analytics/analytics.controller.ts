import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { Request } from 'express';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';

interface RequestWithUser extends Request {
  user: { sub: string };
}

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trading performance analytics for user' })
  @ApiOkResponse({ type: CreateAnalyticsDto })
  async getAnalytics(@Req() req: RequestWithUser): Promise<CreateAnalyticsDto> {
    return this.analyticsService.getUserAnalytics(req.user.sub);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get app stats' })
  async getStats() {
    return this.analyticsService.getAppStats();
  }
}

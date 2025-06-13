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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

interface RequestWithUser extends Request {
  user: { sub: string };
}

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get trading performance analytics for user' })
  @ApiOkResponse({ type: CreateAnalyticsDto })
  async getAnalytics(@Req() req: RequestWithUser): Promise<CreateAnalyticsDto> {
    return this.analyticsService.getUserAnalytics(req.user.sub);
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: 'Get app stats' })
  async getStats() {
    return this.analyticsService.getAppStats();
  }
}

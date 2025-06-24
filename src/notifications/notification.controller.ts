// src/notifications/notification.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NotificationResponseDto } from './dto/notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({
    description: 'Get all notifications',
    type: NotificationResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all notifications for the logged-in user' })
  async getAllNotifications(
    @Req() req: Request & { user: { _id: string; role: string } },
  ) {
    const user = req.user;
    return this.notificationService.getAll(user);
  }
}

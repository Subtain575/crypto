// src/notifications/notification.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/enums/user-role.enum';
import { NotificationResponseDto } from './dto/notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth('JWT-auth')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({
    description: 'Get all notifications',
    type: NotificationResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Get all notifications' })
  async getAllNotifications() {
    return this.notificationService.getAll();
  }
}

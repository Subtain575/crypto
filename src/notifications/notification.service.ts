import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schema/notification.schema';
import { EmailService } from '../auth/email.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private readonly emailService: EmailService,
  ) {}

  async createNotification(
    title: string,
    message: string,
    type: string,
    userId?: string,
    ticketId?: string,
  ) {
    // this.logger.log(`Creating notification for user ${userId}`);
    const notification = await this.notificationModel.create({
      title,
      message,
      type,
      userId,
      ticketId,
    });

    // this.logger.log(`Notification created: ${JSON.stringify(notification)}`);
    try {
      await this.emailService.sendAdminNotificationEmail(title, message);
    } catch (error) {
      this.logger.error('Failed to send admin notification email', error);
    }

    return notification;
  }

  async getAll(user: { sub: string; role: string }) {
    const query = user.role === 'admin' ? {} : { userId: user.sub };
    return this.notificationModel.find(query).sort({ createdAt: -1 }).lean();
  }
  async countUnseenNotifications(user: { sub: string; role: string }) {
    const query = { userId: user.sub, isRead: false };
    return this.notificationModel.countDocuments(query);
  }

  async markAsSeen(user: { sub: string }) {
    return await this.notificationModel.updateMany(
      {
        userId: user.sub,
        isSeen: false,
      },
      { isSeen: true },
    );
  }
}

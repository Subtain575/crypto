import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from './schema/notification.schema';
import { EmailService } from '../auth/email.service';

@Injectable()
export class NotificationService {
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
    await this.notificationModel.create({
      title,
      message,
      type,
      userId,
      ticketId,
    });

    await this.emailService.sendAdminNotificationEmail(title, message);
  }

  async getAll(user: { _id: string; role: string }) {
    const query = user.role === 'admin' ? {} : { userId: user._id };
    return this.notificationModel.find(query).sort({ createdAt: -1 }).lean();
  }
  async countUnseenNotifications(user: { _id: string; role: string }) {
    const query = { userId: user._id, isRead: false };
    return this.notificationModel.countDocuments(query);
  }

  async markAsSeen(userId: string) {
    return await this.notificationModel.updateMany(
      {
        userId: userId,
        isSeen: false,
      },
      { isSeen: true },
    );
  }
}

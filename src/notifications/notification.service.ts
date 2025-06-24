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

  async getAll() {
    return this.notificationModel.find().sort({ createdAt: -1 }).lean();
  }
}

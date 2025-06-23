import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schema/notification.schema';
import { NotificationService } from './notification.service';
import { EmailService } from '../auth/email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationController } from './notification.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
    MailerModule,
  ],
  providers: [NotificationService, EmailService],
  exports: [NotificationService],
  controllers: [NotificationController],
})
export class NotificationModule {}

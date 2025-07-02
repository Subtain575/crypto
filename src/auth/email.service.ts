import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Model } from 'mongoose';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly mailerService: MailerService,
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async sendEmailOtp(email: string, otp: string): Promise<void> {
    try {
      this.logger.log(`Attempting to send OTP email to ${email}`);

      await this.mailerService.sendMail({
        to: email,
        subject: 'Your OTP Code',
        text: `Your verification code is: ${otp}. It will expire in 1 minute.`,
        html: `<p>Your verification code is: <b>${otp}</b>. It will expire in 1 minute.</p>`,
      });

      this.logger.log(`OTP email sent successfully to ${email}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Failed to send OTP email to ${email}:`, errorMessage);
      this.logger.error('Full error details:', error);

      if (errorMessage.includes('ssl3_get_record:wrong version number')) {
        throw new Error(
          'Email service SSL configuration error. Please check SMTP settings.',
        );
      }

      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  async sendAdminNotificationEmail(
    title: string,
    message: string,
  ): Promise<void> {
    try {
      // Get all admin emails from database
      const adminEmails = await this.userModel
        .find({ role: 'admin' })
        .select('email')
        .lean();

      if (adminEmails.length === 0) {
        this.logger.warn('No admin users found to send notification to');
        return;
      }

      // Send to all admins
      await this.mailerService.sendMail({
        to: adminEmails.map((admin: { email: string }) => admin.email),
        subject: `Admin Notification: ${title}`,
        text: message,
        html: `<p>${message}</p>`,
      });

      this.logger.log(
        `Admin notification sent to ${adminEmails.length} admins`,
      );
    } catch (error) {
      this.logger.error('Failed to send admin notification', error);
      // Don't throw so it doesn't block the notification creation
    }
  }

  async sendEmail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }) {
    await this.mailerService.sendMail({
      to,
      subject,
      html,
    });
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly mailerService: MailerService) {}

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
}

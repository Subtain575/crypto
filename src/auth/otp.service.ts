import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp, OtpDocument } from './schema/otp.schema';
import * as nodemailer from 'nodemailer';

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<OtpDocument>) {}

  async generateOtp(email: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const normalizedEmail = email.trim().toLowerCase();
    await this.otpModel.deleteMany({ email: normalizedEmail }); // delete old OTPs

    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 min

    await this.otpModel.create({ email: normalizedEmail, otp, expiresAt });
    await this.sendOtpEmail(normalizedEmail, otp);

    return otp;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    // console.log('Verifying OTP for:', normalizedEmail, normalizedOtp);

    const record = await this.otpModel.findOne({
      email: normalizedEmail,
      otp: normalizedOtp,
    });

    // console.log('Record found:', record);
    // console.log('Current time:', new Date());

    if (!record || record.expiresAt < new Date()) {
      return false;
    }

    await this.otpModel.deleteMany({ email: normalizedEmail }); // cleanup
    return true;
  }

  private async sendOtpEmail(email: string, otp: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Gmail ID
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    await transporter.sendMail({
      to: email,
      subject: 'Verify your email',
      html: `<p>Your OTP is <b>${otp}</b>. It is valid for 1 minutes.</p>`,
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../auth/entities/user.entity';
import { Model } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { CreateUserWithReferralDto } from './dto/referral.dto';

@Injectable()
export class ReferralService {
  private generateId = customAlphabet(
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    8,
  );

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async generateReferralCode(userId: string) {
    const referralCode = this.generateId();
    await this.userModel.findByIdAndUpdate(userId, { referralCode });
    return { referralCode };
  }

  async registerWithReferral(createUserDto: CreateUserWithReferralDto) {
    const { firstName, lastName, email, password, referralCode } =
      createUserDto;
    let referredByUser: UserDocument | null = null;
    if (referralCode) {
      referredByUser = await this.userModel.findOne({ referralCode });
      if (!referredByUser) {
        throw new NotFoundException('Invalid referral code');
      }
    }

    const user = await this.userModel.create({
      firstName,
      lastName,
      email,
      password,
      referralCode: this.generateId(),
      referredBy: referredByUser?._id || null,
      rewardPoints: 0,
    });

    if (referredByUser) {
      await Promise.all([
        this.userModel.findByIdAndUpdate(referredByUser._id, {
          $inc: { rewardPoints: 10 },
        }),
        this.userModel.findByIdAndUpdate(user._id, {
          $inc: { rewardPoints: 5 },
        }),
      ]);
    }

    return user;
  }

  async getReferralStats(userId: string) {
    const referrals = await this.userModel.find({ referredBy: userId });
    return {
      totalReferrals: referrals.length,
      referrals,
    };
  }
}

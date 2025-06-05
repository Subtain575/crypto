import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../auth/schema/user.schema';
import { Model } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { CreateUserWithReferralDto } from './dto/referral.dto';
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { WalletService } from '../wallet/wallet.service';
@Injectable()
export class ReferralService {
  private generateId = customAlphabet(
    '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    8,
  );

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private walletService: WalletService,
  ) {}

  async generateReferralCode(userId: string) {
    const referralCode = this.generateId();
    await this.userModel.findByIdAndUpdate(userId, { referralCode });
    return { referralCode };
  }

  async registerWithReferral(createUserDto: CreateUserWithReferralDto) {
    const { firstName, lastName, email, password, referralCode } =
      createUserDto;

    if (!email) {
      throw new BadRequestException('Email is required');
    }

    // Check if user with email already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Check if referral code is provided and valid
    let referredByUser: UserDocument | null = null;
    if (referralCode) {
      referredByUser = await this.userModel.findOne({ referralCode });
      if (!referredByUser) {
        throw new NotFoundException('Invalid referral code');
      }
    }

    const hashedPassword = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    // Automatically generate referral code here for new user
    const newReferralCode = this.generateId();

    // Create user with generated referral code and optional referredBy
    const user = await this.userModel.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      referralCode: newReferralCode,
      referredBy: referredByUser?._id || null,
      rewardPoints: 0,
    });

    const record = await this.walletService.createWallet(user._id.toString());

    // Update the existing user with wallet instead of creating a new one
    await this.userModel.findByIdAndUpdate(user._id, { wallet: record._id });

    // Add reward points if referred by someone
    if (referredByUser) {
      await Promise.all([
        this.userModel.findByIdAndUpdate(referredByUser._id, {
          $inc: { rewardPoints: 100 },
        }),
        this.userModel.findByIdAndUpdate(user._id, {
          $inc: { rewardPoints: 100 },
        }),
      ]);
    }
    const updatedUser = await this.userModel.findById(user._id);
    return updatedUser;
  }
  async login(email: string, plainPassword: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('User has no password set');
    }

    const isMatch = await bcrypt.compare(plainPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Return token or user info
    return user; // Or JWT, etc.
  }

  async applyReferral(userId: string, referralCode: string) {
    // Find the current user
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.referredBy) {
      throw new BadRequestException('Referral code already applied');
    }

    // Find the user who owns this referral code
    const referredByUser = await this.userModel.findOne({ referralCode });
    if (!referredByUser) {
      throw new NotFoundException('Invalid referral code');
    }

    // Update the referredBy field for current user
    user.referredBy = referredByUser._id;
    await user.save();

    // Add reward points to both users
    const rewardPoints = 100;
    await Promise.all([
      this.userModel.findByIdAndUpdate(referredByUser._id, {
        $inc: { rewardPoints },
      }),
      this.userModel.findByIdAndUpdate(user._id, { $inc: { rewardPoints } }),
    ]);

    // Return updated reward points of current user
    const updatedUser = await this.userModel.findById(userId);
    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return {
      userRewardPoints: updatedUser.rewardPoints,
      referredBy: referredByUser._id,
    };
  }

  async getReferralStats(userId: string) {
    const referrals = await this.userModel.find({
      referredBy: new Types.ObjectId(userId),
    });
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    return {
      totalReferrals: referrals.length,
      referrals,
    };
  }
}

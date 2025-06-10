import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './dtos/register.dto';
import { CreateUserWithReferralDto } from '../referralSystem/dto/referral.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDetails, UserDocument } from './schema/user.schema';
import { UpdateUserDto } from './dtos/update-user.dto';
import { WalletService } from '../wallet/wallet.service';
import { ReferralService } from '../referralSystem/referral.service';
import { OAuth2Client } from 'google-auth-library';
import { OtpService } from './otp.service';
import { EmailService } from './email.service';
import { Otp, OtpDocument } from './schema/otp.schema';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface CustomError extends Error {
  status?: number;
  code?: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private walletService: WalletService,
    private referralService: ReferralService,
    private otpService: OtpService,
    private readonly emailService: EmailService,
    @InjectModel(Otp.name)
    private otpModel: Model<OtpDocument>,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.referralService.registerWithReferral(registerDto);

    if (!user) {
      throw new UnauthorizedException('Failed to register user');
    }

    const wallet = await this.walletService.createWallet(user._id.toString());

    await this.userModel.findByIdAndUpdate(user._id, {
      wallet: wallet._id,
    });

    await this.otpService.generateOtp(user.email);

    // JWT token generate karo
    const token = this.generateToken(user);

    return {
      message: 'User registered successfully. OTP sent to email.',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        referralCode: user.referralCode, // client ko referral code bhi bhej do taake wo share kar sake
      },
    };
  }

  async verifyEmailOtp(email: string, otp: string) {
    const isValid = await this.otpService.verifyOtp(email, otp);
    if (!isValid) throw new BadRequestException('Invalid or expired OTP');

    const user = await this.userModel
      .findOneAndUpdate({ email }, { isEmailVerified: true }, { new: true })
      .select('-password');

    if (!user) throw new NotFoundException('User not found');

    return { message: 'Email verified successfully', user };
  }

  async resendOtp(email: string) {
    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found with this email');
    }

    if (user.isEmailVerified) {
      return { message: 'Email is already verified' };
    }

    // 6-digit OTP generate karo
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute expiry

    // OTP save karo (insert ya update)
    await this.otpModel.findOneAndUpdate(
      { email: user.email.toLowerCase() },
      { otp: otpCode, expiresAt },
      { upsert: true, new: true },
    );

    // OTP Email bhejo (email service call karo)
    await this.emailService.sendEmailOtp(user.email, otpCode);

    return {
      message: 'OTP resent successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in.',
      );
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        referralCode: user.referralCode,
      },
    };
  }

  async validateGoogleToken(googleToken: string, referralCode?: string) {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience:
        '733680592930-nt05q3hf2i9boq7hr71ao7d8r7c2i6av.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    // console.log('Google Payload:', payload);

    if (!payload) {
      throw new UnauthorizedException('Invalid Google token');
    }
    const email = payload.email;

    let user = await this.userModel.findOne({ email });

    if (!user) {
      if (!payload.email) {
        throw new UnauthorizedException('Email not provided by Google');
      }
      const registerDto: CreateUserWithReferralDto = {
        email: payload.email,
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        password: 'google-auth',
        referralCode,
        provider: 'google',
        isGoogleSignup: true,
        profileImage: payload.picture || undefined,
      };

      try {
        user = await this.referralService.registerWithReferral(registerDto);
        if (!user) {
          throw new UnauthorizedException(
            'Failed to register user with Google',
          );
        }
        await this.walletService.createWallet(user._id.toString());
      } catch (err: unknown) {
        const error = err as CustomError;
        if (
          error.status === 409 ||
          error.code === 11000 ||
          error.message?.includes('already exists')
        ) {
          user = await this.userModel.findOne({ email });
        } else {
          throw err;
        }
      }
    }
    if (!user) {
      throw new UnauthorizedException('User could not be found or created');
    }
    const token = this.generateToken(user);
    const wallet = await this.walletService.createWallet(user._id.toString());

    await this.userModel.findByIdAndUpdate(user._id, {
      wallet: wallet._id,
    });
    console.log('Wallet created for:', user._id);
    console.log('Wallet:', wallet);
    return {
      message: 'Sign in successfully via Google',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        referralCode: user.referralCode,
        profileImage: user.profileImage,
      },
      wallet,
    };
  }

  async findAll(currentUser: UserDetails): Promise<UserDocument[]> {
    if (currentUser.role !== 'admin') {
      throw new UnauthorizedException('Only admin can access all users');
    }

    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string, currentUser: UserDetails): Promise<UserDocument> {
    const isAdmin = currentUser.role === 'admin';
    const isSelf = currentUser.sub === id;

    if (!isAdmin && !isSelf) {
      throw new UnauthorizedException('Access denied');
    }

    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: UserDetails,
  ): Promise<UserDocument> {
    const isAdmin = currentUser.role === 'admin';
    const isSelf = currentUser.sub === id;

    if (!isAdmin && !isSelf) {
      throw new UnauthorizedException('Access denied');
    }

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async delete(id: string, currentUser: UserDetails): Promise<UserDocument> {
    const isAdmin = currentUser.role === 'admin';
    const isSelf = currentUser.sub === id;

    if (!isAdmin && !isSelf) {
      throw new UnauthorizedException('You can only delete your own account');
    }

    const deletedUser = await this.userModel
      .findByIdAndDelete(id)
      .select('-password')
      .exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return deletedUser;
  }

  private generateToken(user: UserDocument): string {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}

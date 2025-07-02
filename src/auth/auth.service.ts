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
import { CloudinaryService } from '../simulatedTrading/cloudinary/cloudinary.service';
import { NotificationService } from '../notifications/notification.service';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationService: NotificationService,

    @InjectModel(Otp.name)
    private otpModel: Model<OtpDocument>,
  ) {}

  async register(registerDto: RegisterDto, profileImage?: Express.Multer.File) {
    if (profileImage) {
      const uploadResult = (await this.cloudinaryService.uploadImage(
        profileImage,
      )) as { secure_url: string };
      registerDto.profileImage = uploadResult.secure_url;
    }
    const user = await this.referralService.registerWithReferral(registerDto);

    if (!user) {
      throw new UnauthorizedException('Failed to register user');
    }

    const wallet = await this.walletService.createWallet(user._id.toString());

    await this.userModel.findByIdAndUpdate(user._id, {
      wallet: wallet._id,
    });

    await this.otpService.generateOtp(user.email);

    const token = this.generateToken(user);

    await this.notificationService.createNotification(
      'New User Registered',
      `${user.firstName} ${user.lastName} has registered with email ${user.email}`,
      'register',
      user._id.toString(),
    );

    return {
      message: 'User registered successfully. OTP sent to email.',
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

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 minute expiry

    await this.otpModel.findOneAndUpdate(
      { email: user.email.toLowerCase() },
      { otp: otpCode, expiresAt },
      { upsert: true, new: true },
    );

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
    const user = await this.userModel.findOne({ email });

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
        isEmailVerified: true,
        profileImage: payload.picture || undefined,
      };
      const newUser =
        await this.referralService.registerWithReferral(registerDto);
      if (!newUser) {
        throw new UnauthorizedException('User could not be found or created');
      }
      const isReferred = !!registerDto.referredBy || !!newUser.referredBy;

      const token = this.generateToken(newUser);
      const wallet = await this.walletService.createWallet(
        newUser._id.toString(),
      );

      await this.userModel.findByIdAndUpdate(newUser._id, {
        wallet: wallet._id,
      });
      return {
        message: 'Sign in successfully via Google',
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          referredBy: newUser.referredBy,
          referralCode: newUser.referralCode,
          profileImage: newUser.profileImage,
          isReferred,
        },
        wallet,
      };
    }

    // Existing user login
    const token = this.generateToken(user);
    const wallet = await this.walletService.getWallet(user._id.toString());

    return {
      message: 'Sign in successfully via Google',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        referredBy: user.referredBy,
        referralCode: user.referralCode,
        profileImage: user.profileImage,
        isReferred: !!user.referredBy,
      },
      wallet,
    };
  }
  async findAll(currentUser: UserDetails): Promise<UserDocument[]> {
    if (currentUser.role !== 'admin') {
      throw new UnauthorizedException('Only admin can access all users');
    }

    return this.userModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
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
    profileImage?: Express.Multer.File,
  ): Promise<UserDocument> {
    const isAdmin = currentUser.role === 'admin';
    const isSelf = currentUser.sub === id;

    if (!isAdmin && !isSelf) {
      throw new UnauthorizedException('Access denied');
    }
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (profileImage) {
      // 🗑️ Delete old image from Cloudinary
      if (user.profileImage) {
        const publicId = this.extractPublicIdFromUrl(user.profileImage);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }
      const uploaded = (await this.cloudinaryService.uploadImage(
        profileImage,
      )) as { secure_url: string };
      updateUserDto.profileImage = uploaded.secure_url;
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

  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      return filename.split('.')[0];
    } catch {
      return null;
    }
  }

  async delete(id: string, currentUser: UserDetails): Promise<UserDocument> {
    const isAdmin = currentUser.role === 'admin';
    const isSelf = currentUser.sub === id;

    if (!isAdmin && !isSelf) {
      throw new UnauthorizedException('You can only delete your own account');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (user.profileImage) {
      try {
        const publicId = this.extractPublicIdFromUrl(user.profileImage);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      } catch (error) {
        console.error('Failed to delete Cloudinary image:', error);
        // Continue with user deletion even if image deletion fails
      }
    }

    const deletedUser = await this.userModel
      .findByIdAndDelete(id)
      .select('-password')
      .exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.notificationService.createNotification(
      'User Deleted',
      `${deletedUser.firstName} ${deletedUser.lastName} deleted their account (${deletedUser.email})`,
      'user_deleted',
      deletedUser._id.toString(),
    );

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

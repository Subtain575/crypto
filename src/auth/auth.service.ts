import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './dtos/register.dto';
import { CreateUserWithReferralDto } from '../referralSystem/dto/referral.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDetails, UserDocument } from './entities/user.entity';
import { UpdateUserDto } from './dtos/update-user.dto';
import { WalletService } from '../wallet/wallet.service';
import { ReferralService } from '../referralSystem/referral.service';
import { OAuth2Client } from 'google-auth-library';

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
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.referralService.registerWithReferral(registerDto);
    await this.walletService.createWallet(user._id.toString());

    // JWT token generate karo
    const token = this.generateToken(user);

    return {
      message: 'User registered successfully',
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
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  async validateGoogleToken(googleToken: string) {
    const ticket = await client.verifyIdToken({
      idToken: googleToken,
      audience:
        '1066483579363-71pe1b1scdv096u76td0fmm69fqk58pk.apps.googleusercontent.com',
    });

    const payload = ticket.getPayload();
    console.log('Google Payload:', payload);

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
        referralCode: undefined,
        provider: 'google',
        isGoogleSignup: true,
      };

      try {
        user = await this.referralService.registerWithReferral(registerDto);
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

    return {
      message: user.isGoogleSignup
        ? 'User logged in with Google'
        : 'User registered via Google',
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
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

// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User, UserSchema } from './schema/user.schema';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { WalletModule } from '../wallet/wallet.module';
import { ReferralModule } from '../referralSystem/referral.module';
import { OtpService } from './otp.service';
import { Otp } from './schema/otp.schema';
import { OtpSchema } from './schema/otp.schema';
import { EmailModule } from './email.module';
@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '48h' },
      }),
    }),
    MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]),
    WalletModule,
    ReferralModule,
    EmailModule,
  ],
  providers: [AuthService, JwtStrategy, OtpService],
  controllers: [AuthController],
  exports: [PassportModule, JwtModule, OtpService],
})
export class AuthModule {}

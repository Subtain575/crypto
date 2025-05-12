import { Module } from '@nestjs/common';
import { ReferralService } from './referral.service';
import { ReferralController } from './referral.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../auth/entities/user.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [ReferralController],
  providers: [ReferralService],
})
export class ReferralModule {}

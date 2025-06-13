import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SimulatedTrade,
  SimulatedTradeSchema,
} from '../simulatedTrading/schema/simulatedTrade.schema';
import { Course, CourseSchema } from '@/course-module/schemas/course.schema';
import { User, UserSchema } from '@/auth/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SimulatedTrade.name, schema: SimulatedTradeSchema },
      { name: User.name, schema: UserSchema },
      { name: Course.name, schema: CourseSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}

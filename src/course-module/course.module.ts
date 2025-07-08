import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course, CourseSchema } from './schemas/course.schema';
import {
  CourseProgress,
  CourseProgressSchema,
} from './schemas/user-progress.schema';
import {
  Module as ModuleSchema,
  ModuleSchema as ModuleSchemaClass,
} from './schemas/module.schema';
import {
  DailyWatchStreak,
  DailyWatchStreakSchema,
} from './schemas/daily-watch-streak.schema';
import { SubscribeModule } from '../subscribe/subscribe.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: CourseProgress.name, schema: CourseProgressSchema },
      { name: ModuleSchema.name, schema: ModuleSchemaClass },
      { name: DailyWatchStreak.name, schema: DailyWatchStreakSchema },
    ]),
    SubscribeModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}

// src/course/course.module.ts
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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Course.name, schema: CourseSchema },
      { name: CourseProgress.name, schema: CourseProgressSchema },
      { name: ModuleSchema.name, schema: ModuleSchemaClass },
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}

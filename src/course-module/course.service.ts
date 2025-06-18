import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import {
  CourseProgress,
  CourseProgressDocument,
} from './schemas/user-progress.schema';
import { CreateCourseDto } from './dto/create-course.dto';
import { TrackProgressDto } from './dto/track-progress.dto';
import { Module, ModuleDocument } from './schemas/module.schema';
import {
  DailyWatchStreak,
  DailyWatchStreakDocument,
} from './schemas/daily-watch-streak.schema';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
    @InjectModel(CourseProgress.name)
    private progressModel: Model<CourseProgressDocument>,
    @InjectModel(Module.name)
    private moduleModel: Model<ModuleDocument>,
    @InjectModel(DailyWatchStreak.name)
    private dailyWatchStreakModel: Model<DailyWatchStreakDocument>,
  ) {}

  async getAllCourses() {
    return this.courseModel.find().sort({ createdAt: -1 });
  }

  async getCourseById(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid course ID');

    const course = await this.courseModel.findById(id);
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async createCourse(dto: CreateCourseDto, createdBy: string) {
    const course = new this.courseModel({
      ...dto,
      createdBy: dto.createdBy || createdBy,
    });
    return course.save();
  }

  async updateCourse(id: string, dto: CreateCourseDto) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid course ID');

    const updated = await this.courseModel.findByIdAndUpdate(id, dto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Course not found');
    return updated;
  }

  async deleteCourse(id: string) {
    if (!Types.ObjectId.isValid(id))
      throw new BadRequestException('Invalid course ID');

    const deleted = await this.courseModel.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Course not found');

    return { message: 'Course deleted successfully' };
  }

  async trackProgress(dto: TrackProgressDto) {
    const { user, module, completed, watchedDuration, lastWatched, notes } =
      dto;

    if (!Types.ObjectId.isValid(user.toString()))
      throw new BadRequestException('Invalid user ID');
    if (!Types.ObjectId.isValid(module.toString()))
      throw new BadRequestException('Invalid module ID');

    // Check if module exists
    const moduleData = await this.moduleModel.findById(module);
    if (!moduleData) throw new NotFoundException('Module not found');

    // Check if progress already exists
    let progress = await this.progressModel.findOne({ user, module });

    if (!progress) {
      // Create new progress
      progress = new this.progressModel({
        user,
        module,
        completed,
        watchedDuration,
        lastWatched,
        notes,
      });
    } else {
      // Update existing progress
      progress.completed = completed;
      progress.watchedDuration = watchedDuration;
      progress.lastWatched = lastWatched || progress.lastWatched;
      progress.notes = notes ?? progress.notes;
    }

    await progress.save();
    return progress;
  }
  async handleDailyWatch(userId: string) {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));

    const userObjectId = new Types.ObjectId(userId);

    let streak = await this.dailyWatchStreakModel.findOne({
      user: userObjectId,
    });

    if (!streak) {
      streak = new this.dailyWatchStreakModel({
        user: userObjectId,
        count: 1,
        lastWatchedDate: new Date(),
      });
      await streak.save();
      return { message: 'First video watched. Streak started.', count: 1 };
    }

    const lastWatched = streak.lastWatchedDate;
    const now = new Date();

    const diffInMs = now.getTime() - lastWatched.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (lastWatched >= todayStart && lastWatched <= todayEnd) {
      return { message: 'Already watched video today.', count: streak.count };
    }

    if (diffInHours <= 48 && diffInHours >= 24) {
      streak.count += 1;
      streak.lastWatchedDate = new Date();
      await streak.save();
      return { message: 'Streak continued.', count: streak.count };
    }

    streak.count = 1;
    streak.lastWatchedDate = new Date();
    await streak.save();
    return { message: 'Streak reset. Starting again.', count: streak.count };
  }
}

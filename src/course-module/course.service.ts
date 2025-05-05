// src/course/course.service.ts
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

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name)
    private courseModel: Model<CourseDocument>,
    @InjectModel(CourseProgress.name)
    private progressModel: Model<CourseProgressDocument>,
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

  async createCourse(dto: CreateCourseDto) {
    return this.courseModel.create(dto);
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

  async trackProgress(courseId: string, userId: string, dto: TrackProgressDto) {
    if (!Types.ObjectId.isValid(courseId))
      throw new BadRequestException('Invalid course ID');

    const course = await this.courseModel.findById(courseId);
    if (!course) throw new NotFoundException('Course not found');

    const totalVideos = course.videoUrls.length;
    if (dto.videoIndex < 0 || dto.videoIndex >= totalVideos) {
      throw new BadRequestException('Invalid video index');
    }

    let progress = await this.progressModel.findOne({ userId, courseId });

    if (!progress) {
      progress = new this.progressModel({
        userId,
        courseId,
        progress: new Map(),
        percentageCompleted: 0,
      });
    }
    progress.progress.set(dto.videoIndex, dto.completed);

    const completedVideos = Array.from(progress.progress.values()).filter(
      Boolean,
    ).length;
    progress.percentageCompleted = Math.round(
      (completedVideos / totalVideos) * 100,
    );

    await progress.save();
    return progress;
  }
}

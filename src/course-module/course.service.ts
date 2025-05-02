// import { Model } from 'mongoose';
// import { InjectModel } from '@nestjs/mongoose';
// import { Injectable } from '@nestjs/common';
// import { CreateCourseDto, TrackProgressDto } from './dto/create-course.dto';
// import { CourseSchema } from './schemas/course.schema';
// import { UserProgressSchema } from './schemas/user-progress.schema';

// @Injectable()
// export class CourseService {
//   constructor(
//     @InjectModel('Course') private courseModel: Model<typeof CourseSchema>,
//     @InjectModel('UserProgress')
//     private progressModel: Model<typeof UserProgressSchema>,
//   ) {}

//   async getAllCourses() {
//     return this.courseModel.find();
//   }

//   async getCourseById(id: string) {
//     return this.courseModel.findById(id);
//   }

//   async createCourse(dto: CreateCourseDto) {
//     return this.courseModel.create(dto);
//   }

//   async updateCourse(id: string, dto: CreateCourseDto) {
//     return this.courseModel.findByIdAndUpdate(id, dto, { new: true });
//   }

//   async deleteCourse(id: string) {
//     return this.courseModel.findByIdAndDelete(id);
//   }

//   async trackProgress(userId: string, courseId: string, dto: TrackProgressDto) {
//     const course = await this.courseModel.findById(courseId);
//     const progress = (dto.completedVideos.length / course.videos.length) * 100;

//     return this.progressModel.findOneAndUpdate(
//       { userId, courseId },
//       { completedVideos: dto.completedVideos, progress },
//       { upsert: true, new: true },
//     );
//   }
// }

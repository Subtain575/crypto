import mongoose from 'mongoose';

export const CourseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    level: String,
    videos: [String],
  },
  { timestamps: true },
);

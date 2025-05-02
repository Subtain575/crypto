import mongoose from 'mongoose';

export const UserProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    completedVideos: [String],
    progress: Number,
  },
  { timestamps: true },
);

import mongoose from 'mongoose';
export declare const UserProgressSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    completedVideos: string[];
    userId?: mongoose.Types.ObjectId | null | undefined;
    progress?: number | null | undefined;
    courseId?: mongoose.Types.ObjectId | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    completedVideos: string[];
    userId?: mongoose.Types.ObjectId | null | undefined;
    progress?: number | null | undefined;
    courseId?: mongoose.Types.ObjectId | null | undefined;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    completedVideos: string[];
    userId?: mongoose.Types.ObjectId | null | undefined;
    progress?: number | null | undefined;
    courseId?: mongoose.Types.ObjectId | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;

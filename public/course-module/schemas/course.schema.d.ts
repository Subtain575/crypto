import mongoose from 'mongoose';
export declare const CourseSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    videos: string[];
    description?: string | null | undefined;
    title?: string | null | undefined;
    level?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    videos: string[];
    description?: string | null | undefined;
    title?: string | null | undefined;
    level?: string | null | undefined;
}>, {}> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    videos: string[];
    description?: string | null | undefined;
    title?: string | null | undefined;
    level?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;

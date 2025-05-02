import { Document } from 'mongoose';
export declare class Reply extends Document {
    ticketId: string;
    userId: string;
    role: string;
    message: string;
}
export declare const ReplySchema: import("mongoose").Schema<Reply, import("mongoose").Model<Reply, any, any, any, Document<unknown, any, Reply, any> & Reply & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Reply, Document<unknown, {}, import("mongoose").FlatRecord<Reply>, {}> & import("mongoose").FlatRecord<Reply> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;

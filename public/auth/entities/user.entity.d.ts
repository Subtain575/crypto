import { Document } from 'mongoose';
export type UserDocument = User & Document;
export declare class User {
    _id: number;
    name: string;
    email: string;
    password: string;
    emailVerified: boolean;
    role: string;
    permissions: {
        permission: string;
    }[];
    department?: string;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User, any> & User & Required<{
    _id: number;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>, {}> & import("mongoose").FlatRecord<User> & Required<{
    _id: number;
}> & {
    __v: number;
}>;

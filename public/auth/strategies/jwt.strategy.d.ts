import { Strategy } from 'passport-jwt';
import { Model } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { ConfigService } from '@nestjs/config';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly userModel;
    private readonly configService;
    constructor(userModel: Model<UserDocument>, configService: ConfigService);
    validate(payload: any): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}> & User & import("mongoose").Document<unknown, any, any, Record<string, any>> & Required<{
        _id: number;
    }> & {
        __v: number;
    }>;
}
export {};

import { Model } from 'mongoose';
import { Reply } from './schemas/reply.schema';
import { CreateReplyDto } from './dto/create-reply.dto';
export declare class ReplyService {
    private replyModel;
    constructor(replyModel: Model<Reply>);
    create(dto: CreateReplyDto): Promise<import("mongoose").Document<unknown, {}, Reply, {}> & Reply & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findByTicket(ticketId: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, Reply, {}> & Reply & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, Reply, {}> & Reply & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, Reply, "find", {}>;
}

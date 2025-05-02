import { ReplyService } from './reply.service';
import { CreateReplyDto } from './dto/create-reply.dto';
export declare class ReplyController {
    private readonly replyService;
    constructor(replyService: ReplyService);
    create(dto: CreateReplyDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/reply.schema").Reply, {}> & import("./schemas/reply.schema").Reply & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findByTicket(ticketId: string): import("mongoose").Query<(import("mongoose").Document<unknown, {}, import("./schemas/reply.schema").Reply, {}> & import("./schemas/reply.schema").Reply & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[], import("mongoose").Document<unknown, {}, import("./schemas/reply.schema").Reply, {}> & import("./schemas/reply.schema").Reply & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }, {}, import("./schemas/reply.schema").Reply, "find", {}>;
}

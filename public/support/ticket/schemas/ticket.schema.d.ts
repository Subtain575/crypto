import { Document } from 'mongoose';
import { TicketStatus } from '../enum/ticket-status.enum';
export declare class Ticket extends Document {
    userId: string;
    subject: string;
    message: string;
    status: TicketStatus;
    replies: {
        userId: string;
        message: string;
        createdAt: Date;
    }[];
}
export declare const TicketSchema: import("mongoose").Schema<Ticket, import("mongoose").Model<Ticket, any, any, any, Document<unknown, any, Ticket, any> & Ticket & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Ticket, Document<unknown, {}, import("mongoose").FlatRecord<Ticket>, {}> & import("mongoose").FlatRecord<Ticket> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;

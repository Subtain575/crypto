import { Model } from 'mongoose';
import { Ticket } from './schemas/ticket.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus } from './enum/ticket-status.enum';
export declare class TicketService {
    private ticketModel;
    constructor(ticketModel: Model<Ticket>);
    create(createTicketDto: CreateTicketDto): Promise<import("mongoose").Document<unknown, {}, Ticket, {}> & Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(status?: TicketStatus): Promise<(import("mongoose").Document<unknown, {}, Ticket, {}> & Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findByUser(userId: string): Promise<(import("mongoose").Document<unknown, {}, Ticket, {}> & Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, Ticket, {}> & Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateStatus(id: string, status: TicketStatus): Promise<(import("mongoose").Document<unknown, {}, Ticket, {}> & Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
    addReply(id: string, updateDto: UpdateTicketDto): Promise<import("mongoose").Document<unknown, {}, Ticket, {}> & Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<(import("mongoose").Document<unknown, {}, Ticket, {}> & Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>;
}

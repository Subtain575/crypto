import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus } from './enum/ticket-status.enum';
import { BaseResponseDto } from '@/shared/dto/base-response.dto';
export declare class TicketController {
    private readonly ticketService;
    constructor(ticketService: TicketService);
    create(dto: CreateTicketDto): Promise<BaseResponseDto<import("mongoose").Document<unknown, {}, import("./schemas/ticket.schema").Ticket, {}> & import("./schemas/ticket.schema").Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    findAll(status?: TicketStatus): Promise<BaseResponseDto<(import("mongoose").Document<unknown, {}, import("./schemas/ticket.schema").Ticket, {}> & import("./schemas/ticket.schema").Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>>;
    findByUser(userId: string): Promise<BaseResponseDto<(import("mongoose").Document<unknown, {}, import("./schemas/ticket.schema").Ticket, {}> & import("./schemas/ticket.schema").Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>>;
    findOne(id: string): Promise<BaseResponseDto<import("mongoose").Document<unknown, {}, import("./schemas/ticket.schema").Ticket, {}> & import("./schemas/ticket.schema").Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    updateStatus(id: string, status: TicketStatus): Promise<BaseResponseDto<(import("mongoose").Document<unknown, {}, import("./schemas/ticket.schema").Ticket, {}> & import("./schemas/ticket.schema").Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>>;
    addReply(id: string, dto: UpdateTicketDto): Promise<BaseResponseDto<import("mongoose").Document<unknown, {}, import("./schemas/ticket.schema").Ticket, {}> & import("./schemas/ticket.schema").Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>>;
    remove(id: string): Promise<BaseResponseDto<(import("mongoose").Document<unknown, {}, import("./schemas/ticket.schema").Ticket, {}> & import("./schemas/ticket.schema").Ticket & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }) | null>>;
}

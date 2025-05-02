import { TicketStatus } from '../enum/ticket-status.enum';
export declare class UpdateTicketDto {
    status?: TicketStatus;
    message?: string;
    userId?: string;
}

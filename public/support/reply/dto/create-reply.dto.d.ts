import { Role } from '../../../auth/enums/role.enum';
export declare class CreateReplyDto {
    ticketId: string;
    userId: string;
    role: Role;
    message: string;
}

import { HttpStatus } from '@nestjs/common';
export declare class ResponseDto<T> {
    message: string;
    statusCode: number;
    data: T;
    constructor(data: T, status?: HttpStatus, message?: string);
}

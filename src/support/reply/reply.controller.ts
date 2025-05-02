// src/reply/reply.controller.ts
import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { CreateReplyDto } from './dto/create-reply.dto';

@Controller('replies')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @Post()
  create(@Body() dto: CreateReplyDto) {
    return this.replyService.create(dto);
  }

  @Get('ticket/:ticketId')
  findByTicket(@Param('ticketId') ticketId: string) {
    return this.replyService.findByTicket(ticketId);
  }
}

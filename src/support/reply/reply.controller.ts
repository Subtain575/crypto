// src/reply/reply.controller.ts
import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ReplyService } from './reply.service';
import { CreateReplyDto } from './dto/create-reply.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('replies')
export class ReplyController {
  constructor(private readonly replyService: ReplyService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateReplyDto) {
    return this.replyService.create(dto);
  }

  @Get('ticket/:ticketId')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  findByTicket(@Param('ticketId') ticketId: string) {
    return this.replyService.findByTicket(ticketId);
  }
}

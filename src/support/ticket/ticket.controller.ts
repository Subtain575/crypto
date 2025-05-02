// src/ticket/ticket.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
  Delete,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus } from './enum/ticket-status.enum';
import { BaseResponseDto } from '@/shared/dto/base-response.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'Ticket fetched successfully',
    type: BaseResponseDto,
  })
  async create(@Body() dto: CreateTicketDto) {
    const newTicket = await this.ticketService.create(dto);
    return new BaseResponseDto(201, 'Ticket created successfully', newTicket);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Tickets fetched successfully',
    type: BaseResponseDto,
  })
  async findAll(@Query('status') status?: TicketStatus) {
    const tickets = await this.ticketService.findAll(status);
    return new BaseResponseDto(200, 'Tickets fetched successfully', tickets);
  }

  @Get('user/:userId')
  @ApiResponse({
    status: 200,
    description: 'User tickets fetched successfully',
    type: BaseResponseDto,
  })
  async findByUser(@Param('userId') userId: string) {
    const tickets = await this.ticketService.findByUser(userId);
    return new BaseResponseDto(
      200,
      'User tickets fetched successfully',
      tickets,
    );
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Ticket fetched successfully',
    type: BaseResponseDto,
  })
  async findOne(@Param('id') id: string) {
    const ticket = await this.ticketService.findOne(id);
    return new BaseResponseDto(200, 'Ticket fetched successfully', ticket);
  }

  @Patch(':id/status')
  @ApiResponse({
    status: 200,
    description: 'Ticket status updated successfully',
    type: BaseResponseDto,
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: TicketStatus,
  ) {
    const updated = await this.ticketService.updateStatus(id, status);
    return new BaseResponseDto(
      200,
      'Ticket status updated successfully',
      updated,
    );
  }

  @Patch(':id/reply')
  @ApiResponse({
    status: 200,
    description: 'Reply added successfully',
    type: BaseResponseDto,
  })
  async addReply(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    const updated = await this.ticketService.addReply(id, dto);
    return new BaseResponseDto(200, 'Reply added successfully', updated);
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Ticket deleted successfully',
    type: BaseResponseDto,
  })
  async remove(@Param('id') id: string) {
    const deleted = await this.ticketService.remove(id);
    return new BaseResponseDto(200, 'Ticket deleted successfully', deleted);
  }
}

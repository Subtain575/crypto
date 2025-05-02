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
import { ApiResponse } from '@nestjs/swagger';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'Ticket fetched successfully',
  })
  async create(@Body() dto: CreateTicketDto) {
    const newTicket = await this.ticketService.create(dto);
    return {
      statusCode: 201,
      message: 'Ticket created successfully',
      data: newTicket,
    };
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Tickets fetched successfully',
  })
  async findAll(@Query('status') status?: TicketStatus) {
    const tickets = await this.ticketService.findAll(status);
    return {
      statusCode: 200,
      message: 'Tickets fetched successfully',
      data: tickets,
    };
  }

  @Get('user/:userId')
  @ApiResponse({
    status: 200,
    description: 'User tickets fetched successfully',
  })
  async findByUser(@Param('userId') userId: string) {
    const tickets = await this.ticketService.findByUser(userId);
    return {
      statusCode: 200,
      message: 'User tickets fetched successfully',
      data: tickets,
    };
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Ticket fetched successfully',
  })
  async findOne(@Param('id') id: string) {
    const ticket = await this.ticketService.findOne(id);
    return {
      statusCode: 200,
      message: 'Ticket fetched successfully',
      data: ticket,
    };
  }

  @Patch(':id/status')
  @ApiResponse({
    status: 200,
    description: 'Ticket status updated successfully',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: TicketStatus,
  ) {
    const updated = await this.ticketService.updateStatus(id, status);
    return {
      statusCode: 200,
      message: 'Ticket status updated successfully',
      data: updated,
    };
  }

  @Patch(':id/reply')
  @ApiResponse({
    status: 200,
    description: 'Reply added successfully',
  })
  async addReply(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    const updated = await this.ticketService.addReply(id, dto);
    return {
      statusCode: 200,
      message: 'Reply added successfully',
      data: updated,
    };
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Ticket deleted successfully',
  })
  async remove(@Param('id') id: string) {
    const deleted = await this.ticketService.remove(id);
    return {
      statusCode: 200,
      message: 'Ticket deleted successfully',
      data: deleted,
    };
  }
}

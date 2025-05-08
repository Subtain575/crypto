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
  NotFoundException,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus } from './enum/ticket-status.enum';
import { ApiQuery, ApiResponse } from '@nestjs/swagger';

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
    if (!newTicket) {
      throw new NotFoundException('Ticket not created');
    }
    return newTicket;
  }

  @Get()
  @ApiQuery({ name: 'status', enum: TicketStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'Tickets fetched successfully',
  })
  async findAll(@Query('status') status?: TicketStatus) {
    const tickets = await this.ticketService.findAll(status);
    return tickets;
  }

  @Get('user/:userId')
  @ApiResponse({
    status: 200,
    description: 'User tickets fetched successfully',
  })
  async findByUser(@Param('userId') userId: string) {
    const tickets = await this.ticketService.findByUser(userId);
    if (!tickets) {
      throw new NotFoundException('User tickets not found');
    }
    return tickets;
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Ticket fetched successfully',
  })
  async findOne(@Param('id') id: string) {
    const ticket = await this.ticketService.findOne(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  @Patch(':id')
  @ApiResponse({
    status: 200,
    description: 'Ticket updated successfully',
  })
  async update(@Param('id') id: string, @Body() dto: CreateTicketDto) {
    const updated = await this.ticketService.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Ticket not found');
    }
    return updated;
  }

  @Patch(':id/reply')
  @ApiResponse({
    status: 200,
    description: 'Reply added successfully',
  })
  async addReply(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    const updated = await this.ticketService.addReply(id, dto);
    if (!updated) {
      throw new NotFoundException('Ticket not found');
    }
    return updated;
  }

  @Delete(':id')
  @ApiResponse({
    status: 200,
    description: 'Ticket deleted successfully',
  })
  async remove(@Param('id') id: string) {
    const deleted = await this.ticketService.remove(id);
    if (!deleted) {
      throw new NotFoundException('Ticket not found');
    }
    return deleted;
  }
}

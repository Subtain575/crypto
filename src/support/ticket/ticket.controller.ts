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
  UseGuards,
  Req,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus } from './enum/ticket-status.enum';
import { ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../../auth/enums/user-role.enum';
import { Roles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    role: UserRole;
    sub: string;
  };
}

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Ticket fetched successfully',
  })
  async create(@Body() dto: CreateTicketDto, @Req() req: RequestWithUser) {
    const user = req.user.sub;
    const newTicket = await this.ticketService.create(dto, user);
    if (!newTicket) {
      throw new NotFoundException('Ticket not created');
    }
    return newTicket;
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
  @ApiQuery({ name: 'status', enum: TicketStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'Tickets fetched successfully',
  })
  async findAll(@Query('status') status?: TicketStatus) {
    const tickets = await this.ticketService.findAll(status);
    return tickets;
  }

  @Get('user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.USER)
  @ApiResponse({
    status: 200,
    description: 'User tickets fetched successfully',
  })
  async findByUser(@Req() req: RequestWithUser) {
    const user = req.user.sub;
    const tickets = await this.ticketService.findByUser(user);
    if (!tickets) {
      throw new NotFoundException('User tickets not found');
    }
    return tickets;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Ticket fetched successfully',
  })
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    const ticket = await this.ticketService.findOne(id);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // 👇 Check if user is not admin and not owner
    if (userRole !== UserRole.ADMIN && ticket.userId !== userId) {
      throw new NotFoundException('You are not allowed to access this ticket');
    }

    return ticket;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Ticket updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() dto: CreateTicketDto,
  ) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    const ticket = await this.ticketService.findOne(id);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // 👇 Check if user is not admin and not the owner
    if (userRole !== UserRole.ADMIN && ticket.userId !== userId) {
      throw new NotFoundException('You are not allowed to update this ticket');
    }

    return this.ticketService.update(id, dto);
  }

  @Patch(':id/reply')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN)
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Ticket deleted successfully',
  })
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    const ticket = await this.ticketService.findOne(id);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // 👇 Only allow if user is ADMIN or ticket owner
    if (userRole !== UserRole.ADMIN && ticket.userId !== userId) {
      throw new NotFoundException('You are not allowed to delete this ticket');
    }

    return this.ticketService.remove(id);
  }
}

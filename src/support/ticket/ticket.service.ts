// src/ticket/ticket.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ticket } from './schemas/ticket.schema';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus } from './enum/ticket-status.enum';

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name)
    private ticketModel: Model<Ticket>,
  ) {}

  async create(createTicketDto: CreateTicketDto, userId: string) {
    const ticketData = {
      ...createTicketDto,
      userId,
    };
    return this.ticketModel.create(ticketData);
  }

  async findAll(status?: TicketStatus) {
    const filter = status ? { status } : {};
    return this.ticketModel.find(filter).sort({ createdAt: -1 });
  }

  async findByUser(userId: string) {
    return this.ticketModel.find({ userId }).sort({ createdAt: -1 });
  }

  async findOne(id: string) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }

  async update(id: string, updateDto: CreateTicketDto) {
    const updatedTicket = await this.ticketModel.findByIdAndUpdate(
      id,
      updateDto,
      {
        new: true,
      },
    );

    if (!updatedTicket) {
      throw new NotFoundException('Ticket not found');
    }

    return updatedTicket;
  }

  async addReply(id: string, updateDto: UpdateTicketDto) {
    const ticket = await this.ticketModel.findById(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    if (!updateDto.userId || !updateDto.message)
      throw new NotFoundException('Missing required fields');

    ticket.replies.push({
      userId: updateDto.userId,
      message: updateDto.message,
      createdAt: new Date(),
    });

    await ticket.save();
    return ticket;
  }

  async remove(id: string) {
    return this.ticketModel.findByIdAndDelete(id);
  }
}

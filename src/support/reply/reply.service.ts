import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Reply } from './schemas/reply.schema';
import { CreateReplyDto } from './dto/create-reply.dto';
import { Ticket } from '../ticket/schemas/ticket.schema';
import { User } from '../../auth/schema/user.schema';
import { EmailService } from '../../auth/email.service';
import { NotificationService } from '../../notifications/notification.service';
@Injectable()
export class ReplyService {
  constructor(
    @InjectModel(Reply.name) private replyModel: Model<Reply>,
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(dto: CreateReplyDto) {
    const reply = await this.replyModel.create(dto);

    // Find ticket
    const ticket = await this.ticketModel.findById(dto.ticketId);
    if (!ticket) throw new NotFoundException('Ticket not found');

    // Find ticket creator
    const user = await this.userModel.findById(ticket.userId);
    if (!user || !user.email) return reply;

    // Send email to user
    await this.emailService.sendEmail({
      to: user.email,
      subject: `Reply to your ticket: ${ticket.subject}`,
      html: `<p>Your ticket has a new reply:</p><p><strong>${dto.message}</strong></p>`,
    });

    await this.notificationService.createNotification(
      'New Reply to Your Ticket',
      `Admin replied to your ticket: ${ticket.subject}`,
      'REPLY',
      user._id.toString(),
      (ticket._id as Types.ObjectId).toString(),
    );

    return reply;
  }

  findByTicket(ticketId: string) {
    return this.replyModel.find({ ticketId }).sort({ createdAt: 1 });
  }
}

// src/reply/reply.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reply } from './schemas/reply.schema';
import { CreateReplyDto } from './dto/create-reply.dto';

@Injectable()
export class ReplyService {
  constructor(@InjectModel(Reply.name) private replyModel: Model<Reply>) {}

  create(dto: CreateReplyDto) {
    return this.replyModel.create(dto);
  }

  findByTicket(ticketId: string) {
    return this.replyModel.find({ ticketId }).sort({ createdAt: 1 });
  }
}

// src/ticket/ticket.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { Ticket, TicketSchema } from './schemas/ticket.schema';
import { NotificationModule } from '../../notifications/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ticket.name, schema: TicketSchema }]),
    NotificationModule,
  ],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}

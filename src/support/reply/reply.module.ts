import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReplyController } from './reply.controller';
import { ReplyService } from './reply.service';
import { Reply, ReplySchema } from './schemas/reply.schema';
import { Ticket, TicketSchema } from '../ticket/schemas/ticket.schema';
import { User, UserSchema } from '../../auth/schema/user.schema';
import { EmailModule } from '../../auth/email.module';
import { NotificationModule } from '../../notifications/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reply.name, schema: ReplySchema },
      { name: Ticket.name, schema: TicketSchema },
      { name: User.name, schema: UserSchema },
    ]),
    EmailModule,
    NotificationModule,
  ],
  controllers: [ReplyController],
  providers: [ReplyService],
})
export class ReplyModule {}

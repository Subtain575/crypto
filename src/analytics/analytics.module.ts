import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SimulatedTrade,
  SimulatedTradeSchema,
} from '../simulatedTrading/schema/simulatedTrade.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SimulatedTrade.name, schema: SimulatedTradeSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}

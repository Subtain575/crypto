import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SimulatedTrade,
  SimulatedTradeSchema,
} from './schema/simulatedTrade.schema';
import {
  SimulatedPortfolio,
  SimulatedPortfolioSchema,
} from './schema/simulated-portfolio.schema';
import { SimulatedTradingService } from './simulated-trading.service';
import { SimulatedTradingController } from './simulated-trading.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SimulatedTrade.name, schema: SimulatedTradeSchema },
      { name: SimulatedPortfolio.name, schema: SimulatedPortfolioSchema },
    ]),
  ],
  controllers: [SimulatedTradingController],
  providers: [SimulatedTradingService],
})
export class SimulatedTradingModule {}

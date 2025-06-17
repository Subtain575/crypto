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
import { WalletModule } from '../wallet/wallet.module';
import { Wallet, WalletSchema } from '../wallet/schema/wallet.schema';
import { User, UserSchema } from '../auth/schema/user.schema';
import { CloudinaryModule } from './cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SimulatedTrade.name, schema: SimulatedTradeSchema },
      { name: SimulatedPortfolio.name, schema: SimulatedPortfolioSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: User.name, schema: UserSchema },
    ]),
    WalletModule,
    CloudinaryModule,
  ],
  controllers: [SimulatedTradingController],
  providers: [SimulatedTradingService],
  exports: [SimulatedTradingService],
})
export class SimulatedTradingModule {}

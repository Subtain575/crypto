import {
  Logger,
  OnModuleInit,
  MiddlewareConsumer,
  Module,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TicketModule } from './support/ticket/ticket.module';
import { ReplyModule } from './support/reply/reply.module';
import { CourseModule } from './course-module/course.module';
import { SubscribeModule } from './subscribe/subscribe.module';
import { RawBodyMiddleware } from './subscribe/middelwares/raw-body.middelware';
import { PortfolioModule } from './portfolio/portfolio.module';
import { WalletModule } from './wallet/wallet.module';
import { ReferralModule } from './referralSystem/referral.module';
import { SimulatedTradingModule } from './simulatedTrading/simulated-trading.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error(
            'MONGODB_URI is not defined in environment variables',
          );
        }
        return {
          uri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          retryAttempts: 3,
          retryDelay: 1000,
        };
      },
    }),
    AuthModule,
    TicketModule,
    ReplyModule,
    CourseModule,
    SubscribeModule,
    WalletModule,
    PortfolioModule,
    ReferralModule,
    SimulatedTradingModule,
    AnalyticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnApplicationBootstrap, OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  onModuleInit() {
    this.logger.log('Module initialized');
  }

  onApplicationBootstrap() {
    this.logger.log('Application bootstrap completed.');
    // this.logger.log(EventCollector.getEvents());
  }

  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RawBodyMiddleware).forRoutes('/subscription/webhook');
  }
}

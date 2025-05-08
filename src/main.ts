import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { Request, Response, NextFunction } from 'express';
import { ResponseInterceptor } from './interceptor/response-interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.useGlobalInterceptors(new ResponseInterceptor());

  // CRITICAL: Set up raw body handling for Stripe and Paypal webhooks
  // This must come BEFORE any json parsers
  const callbackRoutes = ['/subscription/webhook']; // Array of webhook routes

  app.use((req: Request, res: Response, next: NextFunction) => {
    const originalUrl = req.originalUrl;

    // Check if the originalUrl includes any of the callback routes
    if (
      originalUrl &&
      callbackRoutes.some((route) => originalUrl.includes(route))
    ) {
      bodyParser.raw({ type: 'application/json' })(req, res, next);
    } else {
      next();
    }
  });

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Crypto Trading App')
    .setDescription('API documentation for Crypto Trading App')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Crypto Trading API',
    customfavIcon: '/api/favicon-32x32.png',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation is available at: http://localhost:${port}/api`,
  );
}
void bootstrap();

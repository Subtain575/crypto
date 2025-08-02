import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  Logger,
  ValidationPipe,
  HttpException,
  HttpStatus,
  ArgumentsHost,
} from '@nestjs/common';
import * as bodyParser from 'body-parser';
import { Request, Response, NextFunction } from 'express';
import { ResponseInterceptor } from './interceptor/response-interceptor';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

interface MongoError extends Error {
  code: number;
  keyPattern: Record<string, number>;
  keyValue: Record<string, unknown>;
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalInterceptors(new ResponseInterceptor());

  // Add global exception filter for MongoDB duplicate key errors
  app.useGlobalFilters({
    catch(exception: unknown, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const response = ctx.getResponse<Response>();

      if (
        exception &&
        typeof exception === 'object' &&
        'code' in exception &&
        (exception as MongoError).code === 11000
      ) {
        const mongoError = exception as MongoError;
        const field = Object.keys(mongoError.keyPattern)[0];
        const value = String(mongoError.keyValue[field]);
        return response.status(HttpStatus.CONFLICT).json({
          status: HttpStatus.CONFLICT,
          message: `A record with this ${field} (${value}) already exists`,
          error: 'Conflict',
        });
      }

      if (exception instanceof HttpException) {
        return response
          .status(exception.getStatus())
          .json(exception.getResponse());
      }

      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
        error: exception instanceof Error ? exception.message : 'Unknown error',
      });
    },
  });

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

  // Set global prefix
  app.setGlobalPrefix('api');

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const config = new DocumentBuilder()
    .setTitle('Crypto Trading API')
    .setDescription('The Crypto Trading API description')
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

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(
    `Swagger documentation is available at: http://localhost:${port}/api`,
  );
}
void bootstrap();

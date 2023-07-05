import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NextFunction, Request } from 'express';
import rateLimit from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { SQLExceptionFilter } from './logger/filter/sql.exception.filter';

const cookieAuth = (req: Request, res: Response, next: NextFunction) => {
  req.headers['Authorization'] = req.get('Authorization');
  if (req.headers['Authorization'] == null && req.cookies['access_token']) {
    req.headers['Authorization'] = `Bearer ${req.cookies['access_token']}`;
  }
  next();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');
  app.useGlobalFilters(new SQLExceptionFilter);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',  
      'http://localhost:3001',
      // process.env.CLIENT_DOMAIN,
      configService.get('CLIENT_DOMAIN'),
    ],
    credentials: true,
  });
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb' }));
  app.use(helmet());
  app.use(cookieParser());
  app.use(cookieAuth);
  // await app.listen(process.env.PORT || 3000);
  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();

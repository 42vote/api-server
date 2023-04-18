import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppDataSource } from './database';
import { NextFunction, Request } from 'express';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const cookieAuth = (req: Request, res: Response, next: NextFunction) => {
  req.headers['Authorization'] = req.get('Authorization');
  if (req.headers['Authorization'] == null && req.cookies['access_token']) {
    req.headers['Authorization'] = `Bearer ${req.cookies['access_token']}`;
  }
  next();
};

async function bootstrap() {
  dotenv.config();
  await AppDataSource.initialize();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CLIENT_DOMAIN,
    credentials: true,
  });
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minutes
      max: +process.env.LIMIT_FOR_MIN ?? 100, // Limit each IP to 100 requests per `window` (here, per 1 minutes)
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    }),
  );
  app.use(helmet());
  app.use(cookieParser());
  app.use(cookieAuth);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();

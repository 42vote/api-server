import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { AppDataSource } from './database';
import * as cookieParser from "cookie-parser";
import { NextFunction, Request } from 'express';

const cookieAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");
  if (authHeader == null && req.cookies && req.cookies['access_token']) {
    req.headers['Authorization'] = `Bearer ${req.cookies['access_token']}`;
  }
  next();
}

async function bootstrap() {
  dotenv.config();
  await AppDataSource.initialize();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.CLIENT_DOMAIN,
    credentials: true,
  });
  app.use(cookieParser());
  app.use(cookieAuth);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();


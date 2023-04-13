import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { AppDataSource } from './database';

async function bootstrap() {
  dotenv.config();
  await AppDataSource.initialize();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT || 3000);
}
bootstrap();

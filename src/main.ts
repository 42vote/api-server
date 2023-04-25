import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NextFunction, Request } from 'express';
import rateLimit from 'express-rate-limit';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

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

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      // process.env.CLIENT_DOMAIN,
      configService.get('CLIENT_DOMAIN'),
    ],
    credentials: true,
  });
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minutes
      // max: +process.env.LIMIT_FOR_MIN ?? 100, // Limit each IP to 100 requests per `window` (here, per 1 minutes)
      max: +configService.get('LIMIT_FOR_MIN') ?? 100,
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    }),
  );
  app.use(helmet());
  app.use(cookieParser());
  app.use(cookieAuth);
  // await app.listen(process.env.PORT || 3000);
  await app.listen(configService.get('PORT') || 3000);
}
bootstrap();

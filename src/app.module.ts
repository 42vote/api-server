import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { CategoryModule } from './category/category.module';
import { createTypeOrmOptions } from './database';
import { DocumentModule } from './document/document.module';
import { VoteModule } from './vote/vote.module';
import { StatModule } from './stat/stat.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        await createTypeOrmOptions(configService),
      inject: [ConfigService],
    }),
    UserModule,
    CategoryModule,
    DocumentModule,
    VoteModule,
    StatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

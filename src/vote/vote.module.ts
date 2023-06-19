import { Module, ValidationPipe, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from 'src/entity/user.entity';
import Vote from 'src/entity/vote.entity';
import VoteLog from 'src/entity/vote-log.entity';
import Document from 'src/entity/document.entity';
import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';
import { DocumentModule } from 'src/document/document.module';
import { UserModule } from 'src/user/user.module';
import { APP_PIPE } from '@nestjs/core';
import { CategoryModule } from 'src/category/category.module';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Document, Vote, VoteLog]),
    forwardRef(() => DocumentModule),
    UserModule,
    CategoryModule,
  ],
  controllers: [VoteController],
  providers: [VoteService],
  exports: [VoteService],
})
export class VoteModule {}

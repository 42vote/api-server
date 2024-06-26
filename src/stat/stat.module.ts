import { Module } from '@nestjs/common';
import { StatService } from './stat.service';
import { StatController } from './stat.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from 'src/entity/user.entity';
import Vote from 'src/entity/vote.entity';
import Document from 'src/entity/document.entity';
import Category from 'src/entity/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Category, Document, Vote])],
  providers: [StatService],
  controllers: [StatController],
})
export class StatModule {}

import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from 'src/entity/user.entity';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';
import Document from 'src/entity/document.entity';
import Vote from 'src/entity/vote.entity';

@Module({
  imports:[
    ConfigModule,
    TypeOrmModule.forFeature([User, Category, Document, DocOption, Vote])
  ],
  providers: [DocumentService],
  controllers: [DocumentController]
})
export class DocumentModule {}

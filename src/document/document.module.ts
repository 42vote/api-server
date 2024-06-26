import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import User from 'src/entity/user.entity';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';
import Document from 'src/entity/document.entity';
import Vote from 'src/entity/vote.entity';
import { AwsS3Module } from 'src/aws-s3/aws-s3.module';
import Image from 'src/entity/image.entity';
import { UserModule } from 'src/user/user.module';
import { VoteModule } from 'src/vote/vote.module';
import DocumentLog from 'src/entity/document-log.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      Category,
      Document,
      DocumentLog,
      DocOption,
      Vote,
      Image,
    ]),
    AwsS3Module,
    UserModule,
    forwardRef(() => VoteModule),
  ],
  providers: [DocumentService],
  controllers: [DocumentController],
  exports: [DocumentService],
})
export class DocumentModule {}

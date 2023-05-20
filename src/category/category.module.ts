import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import User from 'src/entity/user.entity';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';
import Document from 'src/entity/document.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Category, DocOption, Document]),
  ],
  providers: [CategoryService, ConfigService],
  controllers: [CategoryController],
})
export class CategoryModule {}

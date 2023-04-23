import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from 'src/entity/user.entity';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Category, DocOption])
  ],
  providers: [CategoryService, ConfigService],
  controllers: [CategoryController]
})
export class CategoryModule {}

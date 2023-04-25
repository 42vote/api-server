import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthModule } from 'src/auth/auth.module';
import User from 'src/entity/user.entity';
import Category from 'src/entity/category.entity';
import DocOption from 'src/entity/doc-option.entity';

@Module({
  imports: [
    AuthModule,
    ConfigModule,
    TypeOrmModule.forFeature([User, Category, DocOption]),
  ],
  providers: [UserService, ConfigService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}

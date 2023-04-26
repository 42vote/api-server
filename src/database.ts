import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'reflect-metadata';
import User from './entity/user.entity';
import Document from './entity/document.entity';
import DocOption from './entity/doc-option.entity';
import Vote from './entity/vote.entity';
import Category from './entity/category.entity';
import Image from './entity/image.entity';

export const createTypeOrmOptions = async (
  configService: ConfigService,
): Promise<TypeOrmModuleOptions> => ({
  type: 'mysql',
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASSWORD'),
  database: configService.get<string>('DB_DATABASE'),
  synchronize: true,
  // timezone: 'Asia/Seoul',
  // loggin: false,
  entities: [User, Document, Category, DocOption, Vote, Image],
});

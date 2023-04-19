import 'reflect-metadata';
import { DataSource } from 'typeorm';
import User from './entity/user.entity';
import * as dotenv from 'dotenv';
import Document from './entity/document.entity';
import DocOption from './entity/doc-option.entity';
import Vote from './entity/vote.entity';
import Category from './entity/category.entity';

dotenv.config();
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: true,
  timezone: 'Asia/Seoul',
  // logging: false,
  entities: [User, Document, Category, DocOption, Vote,],
});
 
import { Injectable } from '@nestjs/common';
import { AppDataSource } from 'src/database';
import { Repository } from 'typeorm';
import User from 'src/entity/user.entity';
import * as dotenv from "dotenv";

@Injectable()
export class UserService {
  private userRepo: Repository<User>;
  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
    dotenv.config();
  }

  async getUser(intraId: any): Promise<User | null> {
    return await this.userRepo.findOne({ where: { intraId } });
  }

  async addUser(user: User): Promise<User | null> {
    return await this.userRepo.save(user);
  }

  async updateUser(user: User): Promise<User | null> {
    return await this.userRepo.save(user);
  }
}

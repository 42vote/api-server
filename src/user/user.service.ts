import { Injectable } from '@nestjs/common';
import { AppDataSource } from 'src/database';
import User from 'src/entity/user.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  private userRepo: Repository<User>;
  constructor() {
    this.userRepo = AppDataSource.getRepository(User);
  }

  async getUser(intraId: string) {
    return await this.userRepo.findOne({ where: { intraId } });
  }

  async addUser(user: UserDto) {
    console.log(user);

    return await this.userRepo.save(user);
  }
}

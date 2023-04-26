import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import User from 'src/entity/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

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

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

  async getUserId(intraId: string): Promise<number | null> {
    const user =  await this.userRepo.findOne({ where: { intraId } });
    if (user) { return user.id; }
    else { return null; }
  }

  async addUser(user: User): Promise<User | null> {
    return await this.userRepo.save(user);
  }

  async updateUser(user: User): Promise<User | null> {
    return await this.userRepo.save(user);
  }
}

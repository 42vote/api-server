import { Module } from '@nestjs/common';
import { FTStrategy } from './auth/ft.strategy';
import { SessionSerializer } from './auth/session.serializer';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, FTStrategy, SessionSerializer],
})
export class UserModule {}

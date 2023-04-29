import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

dotenv.config();
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['Authorization'];

    if (auth == null) throw new UnauthorizedException();
    const [type, token] = auth.split(' ') ?? [];
    if (type?.toLowerCase() !== 'Bearer'.toLowerCase() || token == null)
      throw new UnauthorizedException();
    try {
      req.user = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      return true;
    } catch (e) {
      if (e.message === 'jwt expired')
        throw new UnauthorizedException(e.message);
      throw new UnauthorizedException();
    }
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthAdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['Authorization'];

    if (auth == null) throw new UnauthorizedException();
    const [type, token] = auth.split(' ') ?? [];
    if (type?.toLowerCase() !== 'Bearer'.toLowerCase() || token == null)
      throw new UnauthorizedException();
    try {
      const payload = await this.jwtService.verifyAsync(token);
      req.user = payload;
	  if (payload.isAdmin)
		return true;
      return false;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['Authorization'];
    console.log("1", auth, req.cookies["access_token"]);

    if (auth == null)
      throw new UnauthorizedException();
    const [type, token] = auth.split(" ") ?? [];
    console.log("2", type, token);
    if (type !== "Bearer" || token == null)
      throw new UnauthorizedException();
    try {
      const payload = await this.jwtService.verifyAsync(token);
      req.user = payload;
      return true;
    } catch (e) {
      console.log(3);
      throw new UnauthorizedException();
    }
  }
}

import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    dotenv.config();
  }

  @Get('auth_page')
  async authPage(@Req() req, @Res() res) {
    const authSite = `https://api.intra.42.fr/oauth/authorize`;
    const clientId =
      'client_id=u-s4t2ud-dd72647792601b765e45b2925cd5455ca3b035957e70a99241e645fa8d23b4e2';
    const redir = `redirect_uri=${req.headers.referer}auth/42/redirect`;
    const url = `${authSite}?${clientId}&${redir}&response_type=code`;
    res.redirect(url);
  }

  @Post('login')
  async login(@Req() req, @Body('code') code: string) {
    const rawUser = await this.authService.getUserInfoFrom42(
      code,
      req.headers.referer,
    );
    if (rawUser == null) throw new UnauthorizedException(`error`);
    let user = await this.userService.getUser(rawUser.intraId);
    if (user == null) user = await this.userService.addUser(rawUser);
    else this.userService.updateUser(user);
    if (user == null) throw new InternalServerErrorException('not found user');
    const token = await this.authService.createToken(user);
    if (token == null) throw new InternalServerErrorException('asdf');
    this.userService.updateUser({
      ...user,
      jwtRefreshToken: token.refresh_token,
    });
    return { token };
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    let payload = null;
    try {
      payload = await this.authService.verifyRefreshToken(refreshToken);
    } catch (e) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.getUser(payload.intraId);
    if (user == null || user.jwtRefreshToken !== refreshToken)
      throw new UnauthorizedException();
    const token = await this.authService.createToken(user);
    delete token.refresh_token;
    return { token };
  }

  @Post('logout')
  async logout(@Res() res: Response) {
    res.json({ message: 'success logout' });
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    return req['user'];
  }
}

import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
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
    const clientId = `client_id=${process.env.FT_UID}`;
    const redir =
      req.headers.referer == null
        ? `redirect_uri=${process.env.CLIENT_DOMAIN}/auth/42/redirect`
        : `redirect_uri=${req.headers.referer}auth/42/redirect`;
    const url = `${authSite}?${clientId}&${redir}&response_type=code`;
    res.redirect(url);
  }

  @Post('login')
  async login(@Req() req, @Body('code') code: string) {
    let referer =
      req.headers.referer == null
        ? process.env.CLIENT_DOMAIN
        : req.headers.referer;
    referer = new URL(referer).origin;
    const rawUser = await this.authService.getUserInfoFrom42(code, referer);
    if (rawUser == null) throw new UnauthorizedException(`error`);
    let user = await this.userService.getUser(rawUser.intraId);
    if (user == null) user = await this.userService.addUser(rawUser);
    user.wallet = rawUser.wallet;
    user.coalition = rawUser.coalition;
    this.userService.updateUser(user);
    if (user == null) throw new InternalServerErrorException('not found user');
    const token = await this.authService.createToken(user);
    if (token == null) throw new InternalServerErrorException('asdf');

    // 카뎃을 위한 사이트. 피씨너는 로그인할 수 없다.
    if (user.coalition == null)
      throw new UnauthorizedException('for cadet');

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

  @Get('find/:intraId')
  @UseGuards(AuthGuard)
  async findUser(@Param('intraId') intraId: string) {
    if(!(await this.userService.getUser(intraId))) {
      throw new NotFoundException()
    }
    return ;
  }
}

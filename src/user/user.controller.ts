import { Controller, Get, InternalServerErrorException, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';
import * as dotenv from "dotenv";

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {
    dotenv.config();
  }

  @Get('login')
  async login(@Req() req, @Res() res) {
    const authSite = `https://api.intra.42.fr/oauth/authorize`;
    const clientId =
      'client_id=u-s4t2ud-dd72647792601b765e45b2925cd5455ca3b035957e70a99241e645fa8d23b4e2';
    const redir = `redirect_uri=${req.protocol}://${req.headers.host}/user/auth/42/redirect`;
    const url = `${authSite}?${clientId}&${redir}&response_type=code`;
    res.redirect(url);
  }

  @Get('auth/42/redirect')
  async redir(@Query('code') code: string, @Res() res: Response) {
    const rawUser = await this.authService.getUserInfoFrom42(code);
    if (rawUser == null)
      throw new UnauthorizedException(`error`);
    let user = await this.userService.getUser(rawUser.intraId);
    if (user == null)
      user = await this.userService.addUser(rawUser);
    else
      this.userService.updateUser(user);
    if (user == null)
      throw new InternalServerErrorException('not found user');
    const token = await this.authService.createToken(user);
    res.cookie("access_token", token.access_token, {
      maxAge: +process.env.JWT_AGE * 1000,
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.redirect(process.env.CLIENT_DOMAIN);
    // res.json({ message: "Login success" });
  }

  @Get("me")
  @UseGuards(AuthGuard)
  async me(@Req() req: Request) {
    return req["user"];
  }
}

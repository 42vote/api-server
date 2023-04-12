import {
  Controller,
  Get,
  InternalServerErrorException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticatedGuard } from './auth/auth.guard';
import { FTGuard } from './auth/ft.guard';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('login/test')
  page() {
    return `

<html><body>
<script>
function login(){
    window.location = "/user/login"
}
</script>
<button onclick="javascript:login()">로그인</button>
</body></html>

    `;
  }

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  me(@Req() req) {
    const intraId = req.session.passport.user.intraId;
    return this.userService.getUser(intraId);
  }

  @Get('login')
  @UseGuards(FTGuard)
  auth42() {}

  @Get('logout')
  logout(@Req() req): any {
    req.session.destroy();
    return;
  }

  @Get('auth/42/redirect')
  @UseGuards(FTGuard)
  async fortyTwoLoginCallback(@Req() req, @Res() res) {
    const intraId = req.session.passport?.user?.intraId;
    if (intraId == null) throw new InternalServerErrorException();
    const dbUser = await this.userService.getUser(intraId);
    if (dbUser == null)
      await this.userService.addUser(req.session.passport.user);
    res.redirect('/user/me');
  }
}

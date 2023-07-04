import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import User from 'src/entity/user.entity';

dotenv.config();
@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async getUserInfoFrom42(code: string, referer: string) {
    let token = null;
    if (code == null) throw new Error(`auth fail: code is null`);
    try {
      const param = {
        grant_type: 'authorization_code',
        client_id: process.env.FT_UID,
        client_secret: process.env.FT_SECRET,
        redirect_uri: `${referer}/auth/42/redirect`,
        code,
      };
      token = await fetch('https://api.intra.42.fr/oauth/token', {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'post',
        body: JSON.stringify(param),
      }).then((x) => x.json());
      /*res = {
      "access_token": string,
      "token_type": "bearer",
      "expires_in": 7200,
      "refresh_token": string,
      "scope": "public",
      "created_at": number
      }*/
    } catch (e) {
      console.log(e.message);
      return null;
    }
    try {
      if (token == null) throw new Error(`auth fail: token is null`);
      if (token.error) throw new Error(`auth fail: ${token.error}`);
      const rawUser = await fetch('https://api.intra.42.fr/v2/me', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.access_token}`,
        },
      }).then((x) => x.json());
      const coalitions = await fetch(`https://api.intra.42.fr/v2/users/${rawUser.login}/coalitions`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.access_token}`,
        },
      }).then(x => x.json());
      const coalition = coalitions[0]?.slug;
      const expireTime = (+token.expires_in - 200) * 1000;
      const accessTokenExpiredAt = new Date(new Date().getTime() + expireTime);
      return {
        intraId: rawUser.login,
        email: rawUser.email,
        wallet: rawUser.wallet,
        coalition,
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        accessTokenExpiredAt,
      } as User;
    } catch (e) {
      console.log(e.message);
      return null;
    }
  }

  async createToken(user: User) {
    try {
      const payload = {
        userId: user.id,
        intraId: user.intraId,
        isAdmin: user.isAdmin,
        wallet: user.wallet,
        coalition: user.coalition,
      };
      const access_token = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_AGE,
      });
      const refresh_payload = {
        intraId: user.intraId,
      };
      const refresh_token = await this.jwtService.signAsync(refresh_payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_AGE,
      });
      const access_expire = +this.jwtService.decode(access_token)["exp"] * 1000;
      const refresh_expire = +this.jwtService.decode(refresh_token)["exp"] * 1000;
      
      return { access_token, access_expire, refresh_token, refresh_expire };
    } catch (e) {
      console.log('auth.service', e);
      return null;
    }
  }

  async verifyAccessToken(token: string) {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
  }

  async verifyRefreshToken(token: string) {
    return await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
  }
}

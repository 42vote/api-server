import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';

@Injectable()
export class FTStrategy extends PassportStrategy(Strategy, '42') {
  constructor() {
    super({
      clientID: process.env.FT_UID,
      clientSecret: process.env.FT_SECRET,
      callbackURL: '/user/auth/42/redirect',
      scope: ['public'],
      profileFields: {
        userId: 'id',
        email: 'email',
        intraId: 'login',
        userName: 'displayname',
        wallet: 'wallet',
      },
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {

    return {
      userId: profile.userId,
      email: profile.email,
      intraId: profile.intraId,
      userName: profile.userName,
      wallet: profile.wallet,
      accessToken,
      refreshToken,
    };
  }
}

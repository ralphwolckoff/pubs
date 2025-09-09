import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { RequestWithUser } from './jwt.strategy';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: (req: RequestWithUser) => {
        const token = req.user?.refreshToken;
        if (!token) {
          throw new UnauthorizedException(
            'Jeton de rafraîchissement non trouvé',
          );
        }
        return token;
      },
      secretOrKey: process.env.JWT_REFRESH_TOKEN_SECRET as string,
      passReqToCallback: true,
    });
  }

  async validate(req: RequestWithUser, payload: any) {
    const refreshToken = req.user?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Jeton de rafraîchissement non fourni.');
    }
    return { ...payload, refreshToken };
  }
}

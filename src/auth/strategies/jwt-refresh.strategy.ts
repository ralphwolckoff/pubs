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
      jwtFromRequest: (req) => {
        const token = req.cookies['refreshToken'];
        if (!token) {
          throw new UnauthorizedException(
            'Jeton de rafraîchissement non trouvé',
          );
        }
        return token;
      },
      secretOrKey: String(process.env.JWT_REFRESH_TOKEN_SECRET),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Jeton de rafraîchissement non fourni.');
    }
    return { ...payload, refreshToken };
  }
}

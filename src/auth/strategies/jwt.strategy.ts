import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service'; 
import { Role } from 'generated/prisma';
import { Request } from 'express';


export type RequestWithUser = {
  user: JwtPayload;
};
export type JwtPayload = {
  id: string;
  email: string;
  refreshToken:string
  role: Role;
}; 



const cookieExtractor = function (req : Request) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken() || cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET as string
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findByEmail(payload.email);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,

    };
  }
}

import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthCredentialsDto, LoginDto } from './Dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { RegisterAuthDto } from './Dto/signup.dto';
import { RequestWithUser } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { on } from 'events';
import { profile } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: hashedRefreshToken,
      },
    });
  }

  async signup(signupDto: AuthCredentialsDto) {
    const { email, role, password } = signupDto;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ForbiddenException(
        'Un utilisateur avec cet email existe déjà.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        role: role,
        password: hashedPassword,
      },
    });

    const tokens = await this.generateTokens(newUser.id, newUser.email);
    await this.updateRefreshToken(newUser.id, tokens.refreshToken);

    const { password: _, ...userWithoutPassword } = newUser;
    return { ...userWithoutPassword, ...tokens };
  }

  async login(loginDto:LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides.');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    const { password: _, ...userWithoutPassword } = user;
    const { accessToken, refreshToken } = tokens;
    const newUser = { ...userWithoutPassword };
    return {
      newUser: {
        id: newUser.id,
        email: newUser.email,
        onboardingIsCompleted: newUser.onboardingIsCompleted,
        role: newUser.role,
        
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // 1. Vérifie si l'utilisateur existe.
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable.');
    }
    if (!user.refreshToken) {
      throw new UnauthorizedException('token de rafrechissement introuvable');
    }

    // 2. Vérifie si le jeton de rafraîchissement stocké est valide.
    const isTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isTokenValid) {
      throw new ForbiddenException(
        'Jeton de rafraîchissement invalide ou expiré.',
      );
    }

    // 3. Génère de nouveaux jetons.
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }
}

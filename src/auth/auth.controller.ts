// import {
//   Controller,
//   Post,
//   Body,
//   UseGuards,
//   Req,
//   HttpStatus,
//   HttpCode,
//   Get,
//   Request,
// } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';
// import { AuthService } from './auth.service';
// import { LoginDto } from './Dto/login.dto';
// import { LocalAuthGuard } from './guards/local-auth.guard';
// import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
// import { JwtAuthGuard } from './guards/jwt-auth.guard';
// import { Profile, Role } from 'generated/prisma';
// import { Roles } from './decorators/roles.decorator';
// import { RolesGuard } from './guards/roles.guard';
// import { RequestWithUser } from './strategies/jwt.strategy';
// import { RegisterAuthDto } from './Dto/signup.dto';

// @Controller('auth')
// export class AuthController {
//   constructor(private readonly authService: AuthService) {}

//   @Post('signup')
//   signup(@Body() signupDto: RegisterAuthDto) {
//     return this.authService.signup(signupDto);
//   }

//   @UseGuards(LocalAuthGuard)
//   @Post('login')
//   @HttpCode(HttpStatus.OK)
//   async login(@Body() loginDto: LoginDto) {
//     const { accessToken, refreshToken, newUser } =
//       await this.authService.login(loginDto);
//     return { accessToken, refreshToken, newUser };
//   }

//   @UseGuards(JwtRefreshStrategy)
//   @Post('refresh')
//   refreshToken(@Req() req: RequestWithUser) {
//     const userId = req.user.id;
//     const refreshToken = req.user.refreshToken;
//     return this.authService.refreshToken(userId, refreshToken);
//   }

//   @UseGuards(JwtAuthGuard)
//   @Get('user')
//   getUser(@Req() req) {
//     // Le AuthGuard a validé le token et a injecté l'utilisateur
//     // dans l'objet de la requête (req.user)
//     return req.user;
//   }

//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Roles(Role.ADMIN)
//   @Get('admin-only')
//   getAdminData(@Request() req) {
//     return `Bonjour administrateur ${req.user.email} ! Vous avez accès aux données administratives.`;
//   }

//   @UseGuards(JwtAuthGuard)
//   @Post('logout')
//   logout(@Req() req : RequestWithUser) {
//     const userId = req.user.id;
//     return this.authService.logout(userId);
//   }
// }

import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Get,
  UsePipes,
  ValidationPipe,
  Param,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { Response } from 'express';
import { Profile, Role } from 'generated/prisma';
import { RequestWithUser } from './strategies/jwt.strategy';
import { UsersService } from 'src/users/users.service';
import { RegisterAuthDto } from './Dto/signup.dto';
import { AuthCredentialsDto, LoginDto } from './Dto/login.dto';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { CreateProfileDto } from 'src/users/Dto/create-user.dto';

@Controller('auth')
@UsePipes(
  new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  async register(@Body() registerDto: AuthCredentialsDto) {
    const user = await this.authService.signup(registerDto);
    return {
      message: 'Inscription réussie.',
      user: { id: user.id, email: user.email, role: user.role },
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Request() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
    @Body() loginDto: LoginDto,
  ) {
    const { accessToken, refreshToken, newUser } =
      await this.authService.login(loginDto);

    // 1. Sauvegarder le refreshToken dans un cookie HttpOnly.
    // Il est inaccessible par JavaScript pour des raisons de sécurité.
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(
        process.env.JWT_REFRESH_TOKEN_COOKIE_MAX_AGE || '604800000',
        10,
      ),
    });

    // 2. Retourner l'access_token dans le corps de la réponse.
    // Le front-end le stockera pour les requêtes futures.
    return { newUser, accessToken };
  }

  @UseGuards(JwtRefreshStrategy) // Utilise le guard de rafraîchissement
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: RequestWithUser, // Le guard a déjà attaché les données utilisateur
    @Res({ passthrough: true }) res: Response,
  ) {
    console.log(req.user);
    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshToken(req.user.id, req.user.refreshToken);

    // 1. Définir un nouveau cookie pour le refreshToken, en remplacement de l'ancien
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: parseInt(
        process.env.JWT_REFRESH_TOKEN_COOKIE_MAX_AGE || '604800000',
        10,
      ),
    });

    // 2. Retourner le nouvel accessToken dans le corps de la réponse
    return {
      accessToken,
      user: { id: req.user.id },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Request() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(req.user.id);
    // Effacer le cookie de rafraîchissement
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    return { message: 'Déconnexion réussie.' };
  }

  @Post(':userId/profile')
  async createOrUpdateProfile(
    @Param('userId') userId: string,
    @Body() createProfileDto: CreateProfileDto,
  ): Promise<Profile> {
    return this.userService.updateProfile(userId, createProfileDto);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // async getProfile(@Request() req: RequestWithUser) {
  //   const Profile = await this.userService.getUserProfile(req.user.id);
  //   return Profile;
  // }

  @UseGuards(JwtAuthGuard)
  @Get('user')
  getUser(@Req() req: RequestWithUser) {
    // Le AuthGuard a validé le token et a injecté l'utilisateur
    // dans l'objet de la requête (req.user)
    return req.user;
  }

  @Get('status')
  async getAuthStatus(@Request() req: RequestWithUser) {
    try {
      if (req.user) {
        return {
          isAuthenticated: true,
          user: { id: req.user.id, email: req.user.email, role: req.user.role },
        };
      } else {
        return { isAuthenticated: false, user: null };
      }
    } catch (error) {
      return { isAuthenticated: false, user: null };
    }
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin-only')
  getAdminData(@Request() req: RequestWithUser) {
    return `Bonjour administrateur ${req.user.email} ! Vous avez accès aux données administratives.`;
  }
}

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Disable2FaDto, Enable2FaDto, Verify2FaDto } from './dto/two-factor.dto';

@ApiTags('Authentication')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered.' })
  @Public()
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Log in user' })
  @ApiResponse({ status: 200, description: 'User successfully logged in.' })
  @Public()
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(dto);

    if ('requiresTwoFactor' in result) {
      return result;
    }

    const { accessToken, refreshToken } = result;

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Access token successfully refreshed.' })
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.refreshToken(
      req.cookies?.refresh_token,
    );

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @ApiOperation({ summary: 'Log out user' })
  @ApiResponse({ status: 204, description: 'User successfully logged out.' })
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
  }

  @ApiOperation({ summary: 'Google OAuth login' })
  @ApiResponse({ status: 200, description: 'Redirects to Google for authentication.' })
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {}

  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 200, description: 'Google authentication successful.' })
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request & { user: AuthenticatedUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.generateTokens(req.user.id);
    
    this.setRefreshTokenCookie(res, result.refreshToken);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
  }

  @ApiOperation({ summary: 'Setup Two-Factor Authentication' })
  @ApiResponse({ status: 200, description: '2FA setup initiated successfully.' })
  @Post('2fa/setup')
  @HttpCode(HttpStatus.OK)
  setup2fa(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.setup2fa(user.id);
  }

  @ApiOperation({ summary: 'Enable Two-Factor Authentication' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully.' })
  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  enable2fa(@CurrentUser() user: AuthenticatedUser, @Body() dto: Enable2FaDto) {
    return this.authService.enable2fa(user.id, dto.code);
  }

  @ApiOperation({ summary: 'Verify Two-Factor Authentication code' })
  @ApiResponse({ status: 200, description: '2FA verified successfully.' })
  @Public()
  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  async verify2fa(
    @Body() dto: Verify2FaDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.verify2fa(
      dto.tempToken,
      dto.code,
    );

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @ApiOperation({ summary: 'Disable Two-Factor Authentication' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully.' })
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  disable2fa(@CurrentUser() user: AuthenticatedUser, @Body() dto: Disable2FaDto) {
    return this.authService.disable2fa(user.id, dto.code);
  }

  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user retrieved successfully.' })
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }
}

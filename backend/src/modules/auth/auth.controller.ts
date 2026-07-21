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
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
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
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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
  @ApiResponse({ status: 302, description: 'Redirects to Google for authentication.' })
  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This method body intentionally stays empty.
    // @UseGuards(AuthGuard('google')) intercepts this request before
    // the method body runs. Passport redirects the browser to Google's
    // OAuth consent screen automatically.
    // The method body is never executed — the redirect happens in the guard.
  }

  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Google authentication successful, redirects to frontend.' })
  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // After AuthGuard('google') runs, it has:
    // 1. Exchanged the ?code= query param for a Google access token
    // 2. Called GoogleStrategy.validate() with the profile data
    // 3. Attached the result of validate() to req.user
    //
    // req.user is now the object we passed to done() in validate():
    // { googleId, email, name, avatarUrl }

    const googleUser = req.user as {
      googleId: string;
      email: string | null;
      name: string;
      avatarUrl: string | null;
    };

    // Upsert the user in the database (find or create)
    const user = await this.authService.upsertGoogleUser(googleUser);

    // Issue JWT tokens — same method used after email/password login
    const { accessToken, refreshToken } = await this.authService.generateTokens(user.id);

    // Set the refresh token as an httpOnly cookie
    // Use the EXACT same cookie options as the login endpoint
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    // Redirect to the frontend with the access token in the URL.
    // We use a query param because this is a browser redirect — we cannot
    // set a JSON response body on a redirect. The frontend will read the
    // token from the URL, store it in memory, then remove it from the URL
    // (to avoid the token appearing in browser history).
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/oauth/callback?token=${accessToken}`);

    // Security note on the token in the URL:
    // This is a short-lived access token (15 minutes). Putting it in a
    // query param is a common OAuth pattern and an acceptable tradeoff.
    // The frontend MUST remove it from the URL immediately after reading it.
    // The refresh token (long-lived, sensitive) is in the httpOnly cookie —
    // it never appears in a URL.
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

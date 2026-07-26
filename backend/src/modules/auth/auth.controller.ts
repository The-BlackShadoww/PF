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
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user.interface';
import { ApiErrorResponse } from '../../common/swagger/api-response.swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { DisableTwoFactorDto, EnableTwoFactorDto, VerifyTwoFactorDto } from './dto/two-factor.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with email and password. ' +
      'Default categories are seeded automatically on registration.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        data: { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Ashikur Rahman', email: 'ashikur@example.com', createdAt: '2025-01-15T10:30:00Z' },
        meta: { timestamp: '2025-01-15T10:30:00Z' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error — missing or invalid fields', type: ApiErrorResponse })
  @ApiResponse({ status: 409, description: 'Email already registered', type: ApiErrorResponse })
  @Public()
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({
    summary: 'Log in with email and password',
    description: 'Returns an access token on success. ' +
      'If the account has 2FA enabled, returns `requiresTwoFactor: true` and a `tempToken` instead. ' +
      'The refresh token is set as an httpOnly cookie automatically.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        data: { accessToken: 'eyJhbGciOiJIUzI1NiJ9...' },
        meta: { timestamp: '2025-01-15T10:30:00Z' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials', type: ApiErrorResponse })
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

  @ApiOperation({
    summary: 'Refresh the access token',
    description: 'Reads the refresh_token httpOnly cookie and issues a new access token. ' +
      'The old refresh token is rotated (invalidated and replaced). ' +
      'Send this request with credentials included so the cookie is forwarded.',
  })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({
    status: 200,
    description: 'New access token issued',
    schema: {
      example: {
        data: { accessToken: 'eyJhbGciOiJIUzI1NiJ9...' },
        meta: { timestamp: '2025-01-15T10:30:00Z' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing, expired, or already-rotated refresh token', type: ApiErrorResponse })
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

  @ApiOperation({
    summary: 'Log out user',
    description: 'Clears the refresh token cookie.',
  })
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

  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile of the currently authenticated user.',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    schema: {
      example: {
        data: { id: '550e8400-e29b-41d4-a716-446655440000', name: 'Ashikur Rahman', email: 'ashikur@example.com' },
        meta: { timestamp: '2025-01-15T10:30:00Z' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Missing or invalid access token', type: ApiErrorResponse })
  @Get('me')
  getMe(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @ApiOperation({
    summary: 'Initiate Google OAuth login',
    description: 'Redirects the browser to Google\'s OAuth consent screen. ' +
      'Do not call this from an API client — open it in a browser tab. ' +
      'After the user consents, Google redirects to GET /auth/google/callback.',
  })
  @ApiResponse({ status: 302, description: 'Redirect to Google consent screen' })
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

  @ApiOperation({
    summary: 'Google OAuth callback',
    description: 'Handles the redirect from Google after the user consents. ' +
      'Do not call this directly — Google calls it automatically. ' +
      'On success, redirects to the frontend with ?token=<accessToken> in the URL.',
  })
  @ApiResponse({ status: 302, description: 'Redirect to frontend with access token in query param' })
  @ApiResponse({ status: 401, description: 'OAuth verification failed', type: ApiErrorResponse })
  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const googleUser = req.user as {
      googleId: string;
      email: string | null;
      name: string;
      avatarUrl: string | null;
    };

    const user = await this.authService.upsertGoogleUser(googleUser);
    const { accessToken, refreshToken } = await this.authService.generateTokens(user.id);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/oauth/callback?token=${accessToken}`);
  }

  @ApiOperation({
    summary: 'Generate a 2FA secret and QR code',
    description: 'Generates a TOTP secret, stores it (encrypted) on the user account, ' +
      'and returns an otpauth:// URL and a QR code PNG as a base64 data URL. ' +
      'The user scans the QR code with their authenticator app. ' +
      '2FA is NOT active until POST /auth/2fa/enable is called with a valid code.',
  })
  @ApiBearerAuth('access-token')
  @ApiResponse({
    status: 200,
    description: 'QR code and OTP auth URL generated',
    schema: {
      example: {
        data: {
          otpAuthUrl: 'otpauth://totp/FinanceApp:user@example.com?secret=BASE32&issuer=FinanceApp',
          qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgo...',
        },
        meta: { timestamp: '2025-01-15T10:30:00Z' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized', type: ApiErrorResponse })
  @Post('2fa/setup')
  @HttpCode(HttpStatus.OK)
  async setupTwoFactor(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.setupTwoFactor(user.id, user.email);
  }

  @ApiOperation({
    summary: 'Enable 2FA after verifying the first code',
    description: 'Verifies the submitted TOTP code against the stored secret. ' +
      'If valid, sets twoFactorEnabled = true on the account. ' +
      'Must be called after POST /auth/2fa/setup.',
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: EnableTwoFactorDto })
  @ApiResponse({
    status: 200,
    description: '2FA enabled successfully',
    schema: { example: { data: { success: true }, meta: { timestamp: '2025-01-15T10:30:00Z' } } },
  })
  @ApiResponse({ status: 400, description: '2FA already enabled or setup not called first', type: ApiErrorResponse })
  @ApiResponse({ status: 401, description: 'Invalid TOTP code', type: ApiErrorResponse })
  @Post('2fa/enable')
  @HttpCode(HttpStatus.OK)
  async enableTwoFactor(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EnableTwoFactorDto,
  ) {
    return this.authService.enableTwoFactor(user.id, dto.code);
  }

  @ApiOperation({
    summary: 'Complete login with a 2FA code',
    description: 'The second step of login when 2FA is enabled. ' +
      'Submit the tempToken received from POST /auth/login along with the current TOTP code. ' +
      'On success, issues a full access token and sets the refresh token cookie.',
  })
  @ApiBody({ type: VerifyTwoFactorDto })
  @ApiResponse({
    status: 200,
    description: '2FA verified — full access token issued',
    schema: {
      example: {
        data: { accessToken: 'eyJhbGciOiJIUzI1NiJ9...' },
        meta: { timestamp: '2025-01-15T10:30:00Z' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid tempToken or invalid TOTP code', type: ApiErrorResponse })
  @Public()
  @Post('2fa/verify')
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @HttpCode(HttpStatus.OK)
  async verifyTwoFactor(
    @Body() dto: VerifyTwoFactorDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken } = await this.authService.verifyTwoFactorLogin(
      dto.tempToken,
      dto.code,
    );

    this.setRefreshTokenCookie(res, refreshToken);

    return { accessToken };
  }

  @ApiOperation({
    summary: 'Disable 2FA with code confirmation',
    description: 'Disables 2FA on the account. Requires a valid TOTP code to confirm. ' +
      'After disabling, the stored secret is cleared.',
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: DisableTwoFactorDto })
  @ApiResponse({
    status: 200,
    description: '2FA disabled successfully',
    schema: { example: { data: { success: true }, meta: { timestamp: '2025-01-15T10:30:00Z' } } },
  })
  @ApiResponse({ status: 401, description: 'Invalid TOTP code', type: ApiErrorResponse })
  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  async disableTwoFactor(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: DisableTwoFactorDto,
  ) {
    return this.authService.disableTwoFactor(user.id, dto.code);
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

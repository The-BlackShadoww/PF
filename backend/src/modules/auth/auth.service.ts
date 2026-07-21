import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomUUID } from 'crypto';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import * as OTPAuth from 'otpauth';
import * as qrcode from 'qrcode';
import { DB_TOKEN, type DrizzleDB } from '../../db/db.constants';
import { categories, refreshTokens, users } from '../../db/schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

export type LoginResult =
  | { requiresTwoFactor: true; tempToken: string }
  | { accessToken: string; refreshToken: string };

type TokenResult = {
  accessToken: string;
  refreshToken: string;
};

type TokenFamily = ReturnType<typeof randomUUID>;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async upsertGoogleUser(googleUser: {
    googleId: string;
    email: string | null;
    name: string;
    avatarUrl: string | null;
  }): Promise<{ id: string; email: string; name: string }> {

    // Step 1: Try to find an existing user by googleId
    // This handles returning users who previously signed in with Google
    const existingByGoogleId = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.googleId, googleUser.googleId),
          isNull(users.deletedAt),
        )
      )
      .limit(1);

    if (existingByGoogleId.length > 0) {
      // User exists — return them as-is
      // We intentionally do NOT update their name or avatar on every login:
      // if they changed their Google profile but also customized their app
      // profile, we'd silently overwrite their changes. Let them update
      // their profile manually in Settings.
      const user = existingByGoogleId[0];
      return { id: user.id, email: user.email, name: user.name };
    }

    // Step 2: If no user found by googleId, check if their email already exists
    // This handles the case: user registered with email/password using the SAME
    // email address, then later tries to "Sign in with Google".
    // We link the Google account to their existing account instead of
    // creating a duplicate account.
    if (googleUser.email) {
      const existingByEmail = await this.db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, googleUser.email),
            isNull(users.deletedAt),
          )
        )
        .limit(1);

      if (existingByEmail.length > 0) {
        // Link the Google ID to the existing account
        const [updatedUser] = await this.db
          .update(users)
          .set({
            googleId: googleUser.googleId,
            avatarUrl: googleUser.avatarUrl ?? existingByEmail[0].avatarUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingByEmail[0].id))
          .returning({ id: users.id, email: users.email, name: users.name });

        return updatedUser;
      }
    }

    // Step 3: Completely new user — create their account
    // OAuth users have no passwordHash (they authenticate via Google, not password)
    const email = googleUser.email;
    if (!email) {
      // Google did not return an email — this is rare but possible
      // (user may have denied email permission in the consent screen)
      // We cannot create an account without an email — it's our unique identifier
      throw new BadRequestException(
        'Google account did not provide an email address. ' +
        'Please ensure your Google account has a verified email.'
      );
    }

    const [newUser] = await this.db
      .insert(users)
      .values({
        name: googleUser.name,
        email: email,
        passwordHash: null,       // OAuth users have no password
        googleId: googleUser.googleId,
        avatarUrl: googleUser.avatarUrl,
        // twoFactorEnabled defaults to false (from schema)
        // timezone defaults to 'UTC' (from schema)
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    await this.seedDefaultCategories(newUser.id);

    return newUser;
  }

  async register(dto: RegisterDto): Promise<RegisteredUser> {
    const [existing] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, dto.email), isNull(users.deletedAt)))
      .limit(1);

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const [user] = await this.db
      .insert(users)
      .values({
        name: dto.name,
        email: dto.email,
        passwordHash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });

    await this.seedDefaultCategories(user.id);

    return user;
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    const [user] = await this.db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
        twoFactorEnabled: users.twoFactorEnabled,
      })
      .from(users)
      .where(and(eq(users.email, dto.email), isNull(users.deletedAt)))
      .limit(1);

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.twoFactorEnabled) {
      const tempToken = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '5m' },
      );
      return { requiresTwoFactor: true, tempToken };
    }

    return this.generateTokens(user.id);
  }

  async refreshToken(rawRefreshToken?: string): Promise<TokenResult> {
    if (!rawRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const [family, rawToken, extra] = rawRefreshToken.split('.');

    if (
      !family ||
      !rawToken ||
      extra !== undefined ||
      !UUID_PATTERN.test(family)
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenFamily = family as TokenFamily;

    const now = new Date();
    const [activeToken] = await this.db
      .select({
        id: refreshTokens.id,
        userId: refreshTokens.userId,
        tokenHash: refreshTokens.tokenHash,
      })
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.tokenFamily, tokenFamily),
          eq(refreshTokens.isRevoked, false),
          gt(refreshTokens.expiresAt, now),
        ),
      )
      .orderBy(desc(refreshTokens.createdAt))
      .limit(1);

    if (!activeToken) {
      const [latestFamilyToken] = await this.db
        .select({
          userId: refreshTokens.userId,
          isRevoked: refreshTokens.isRevoked,
        })
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenFamily, tokenFamily))
        .orderBy(desc(refreshTokens.createdAt))
        .limit(1);

      if (latestFamilyToken?.isRevoked) {
        await this.revokeAllRefreshTokens(latestFamilyToken.userId);
      }

      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenMatches = await bcrypt.compare(rawToken, activeToken.tokenHash);

    if (!tokenMatches) {
      await this.revokeAllRefreshTokens(activeToken.userId);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const [user] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, activeToken.userId), isNull(users.deletedAt)))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(eq(refreshTokens.id, activeToken.id));

    return this.generateTokens(user.id, tokenFamily);
  }

  async generateTokens(
    userId: string,
    tokenFamily: TokenFamily = randomUUID(),
  ): Promise<TokenResult> {
    const accessToken = this.jwtService.sign({
      sub: userId,
      type: 'access',
    });

    const refreshTokenValue = randomBytes(64).toString('hex');
    const tokenHash = await bcrypt.hash(refreshTokenValue, 12);

    const refreshExpiresIn =
      this.configService.get<string>('jwt.refreshTokenExpiresIn') ?? '7d';
    const expiresAt = new Date(
      Date.now() + this.parseDuration(refreshExpiresIn),
    );

    await this.db.insert(refreshTokens).values({
      userId,
      tokenFamily,
      tokenHash,
      expiresAt,
      isRevoked: false,
    });

    return { accessToken, refreshToken: `${tokenFamily}.${refreshTokenValue}` };
  }

  async setup2fa(userId: string) {
    const [user] = await this.db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'PersonalFinance',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: new OTPAuth.Secret(),
    });

    const secret = totp.secret.base32;
    const otpAuthUrl = totp.toString();
    const qrCodeDataUrl = await qrcode.toDataURL(otpAuthUrl);

    await this.db
      .update(users)
      .set({ twoFactorSecret: secret })
      .where(eq(users.id, userId));

    return { otpAuthUrl, qrCodeDataUrl };
  }

  async enable2fa(userId: string, code: string) {
    const [user] = await this.db
      .select({ id: users.id, twoFactorSecret: users.twoFactorSecret })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!user || !user.twoFactorSecret) {
      throw new ConflictException('2FA setup not initiated');
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'PersonalFinance',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret),
    });

    const isValid = totp.validate({ token: code, window: 1 }) !== null;

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.db
      .update(users)
      .set({ twoFactorEnabled: true })
      .where(eq(users.id, userId));

    return { success: true };
  }

  async verify2fa(tempToken: string, code: string): Promise<TokenResult> {
    let userId: string;
    try {
      const payload = this.jwtService.verify(tempToken);
      userId = payload.sub;
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired temporary token');
    }

    const [user] = await this.db
      .select({
        id: users.id,
        twoFactorSecret: users.twoFactorSecret,
        twoFactorEnabled: users.twoFactorEnabled,
      })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA is not enabled for this user');
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'PersonalFinance',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret),
    });

    const isValid = totp.validate({ token: code, window: 1 }) !== null;

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    return this.generateTokens(user.id);
  }

  async disable2fa(userId: string, code: string) {
    const [user] = await this.db
      .select({
        id: users.id,
        twoFactorSecret: users.twoFactorSecret,
        twoFactorEnabled: users.twoFactorEnabled,
      })
      .from(users)
      .where(and(eq(users.id, userId), isNull(users.deletedAt)))
      .limit(1);

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new ConflictException('2FA is not enabled');
    }

    const totp = new OTPAuth.TOTP({
      issuer: 'PersonalFinance',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.twoFactorSecret),
    });

    const isValid = totp.validate({ token: code, window: 1 }) !== null;

    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.db
      .update(users)
      .set({ twoFactorEnabled: false, twoFactorSecret: null })
      .where(eq(users.id, userId));

    return { success: true };
  }

  private async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.db
      .update(refreshTokens)
      .set({ isRevoked: true })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.isRevoked, false),
          gt(refreshTokens.expiresAt, new Date()),
        ),
      );
  }

  private parseDuration(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000;
    }

    const value = parseInt(match[1], 10);
    const unitMs: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * unitMs[match[2]];
  }

  private async seedDefaultCategories(userId: string): Promise<void> {
    const defaults = [
      // Income categories
      { name: 'Salary',        type: 'income' as const,  color: '#16a34a', icon: 'briefcase',       isDefault: true, sortOrder: 0 },
      { name: 'Freelance',     type: 'income' as const,  color: '#2563eb', icon: 'laptop',          isDefault: true, sortOrder: 1 },
      { name: 'Investment',    type: 'income' as const,  color: '#7c3aed', icon: 'trending-up',     isDefault: true, sortOrder: 2 },
      { name: 'Other Income',  type: 'income' as const,  color: '#0891b2', icon: 'plus-circle',     isDefault: true, sortOrder: 3 },
      // Expense categories
      { name: 'Groceries',     type: 'expense' as const, color: '#dc2626', icon: 'shopping-cart',   isDefault: true, sortOrder: 0 },
      { name: 'Rent',          type: 'expense' as const, color: '#ea580c', icon: 'home',            isDefault: true, sortOrder: 1 },
      { name: 'Utilities',     type: 'expense' as const, color: '#d97706', icon: 'zap',             isDefault: true, sortOrder: 2 },
      { name: 'Transport',     type: 'expense' as const, color: '#65a30d', icon: 'car',             isDefault: true, sortOrder: 3 },
      { name: 'Entertainment', type: 'expense' as const, color: '#0284c7', icon: 'film',            isDefault: true, sortOrder: 4 },
      { name: 'Health',        type: 'expense' as const, color: '#db2777', icon: 'heart',           isDefault: true, sortOrder: 5 },
      { name: 'Other Expense', type: 'expense' as const, color: '#6b7280', icon: 'more-horizontal', isDefault: true, sortOrder: 6 },
    ];

    await this.db.insert(categories).values(
      defaults.map(d => ({ ...d, userId }))
    );
  }
}

import {
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

  async validateGoogleUser(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): Promise<RegisteredUser> {
    const [existingUser] = await this.db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
        googleId: users.googleId,
      })
      .from(users)
      .where(and(eq(users.email, profile.email), isNull(users.deletedAt)))
      .limit(1);

    if (existingUser) {
      if (!existingUser.googleId) {
        const [updatedUser] = await this.db
          .update(users)
          .set({ googleId: profile.googleId, avatarUrl: profile.avatarUrl })
          .where(eq(users.id, existingUser.id))
          .returning({
            id: users.id,
            name: users.name,
            email: users.email,
            createdAt: users.createdAt,
          });
        return updatedUser;
      }
      return {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        createdAt: existingUser.createdAt,
      };
    }

    const [newUser] = await this.db
      .insert(users)
      .values({
        name: profile.name,
        email: profile.email,
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });

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

  private async seedDefaultCategories(userId: string) {
    const defaultCategories = [
      { userId, name: 'Salary', type: 'income' as const, color: '#10b981', icon: 'banknote', isDefault: true, sortOrder: 0 },
      { userId, name: 'Freelance', type: 'income' as const, color: '#3b82f6', icon: 'briefcase', isDefault: true, sortOrder: 1 },
      { userId, name: 'Groceries', type: 'expense' as const, color: '#f59e0b', icon: 'shopping-cart', isDefault: true, sortOrder: 2 },
      { userId, name: 'Rent', type: 'expense' as const, color: '#ef4444', icon: 'home', isDefault: true, sortOrder: 3 },
      { userId, name: 'Utilities', type: 'expense' as const, color: '#6366f1', icon: 'zap', isDefault: true, sortOrder: 4 },
      { userId, name: 'Transport', type: 'expense' as const, color: '#8b5cf6', icon: 'car', isDefault: true, sortOrder: 5 },
      { userId, name: 'Entertainment', type: 'expense' as const, color: '#ec4899', icon: 'film', isDefault: true, sortOrder: 6 },
      { userId, name: 'Health', type: 'expense' as const, color: '#14b8a6', icon: 'heart', isDefault: true, sortOrder: 7 },
    ];
    await this.db.insert(categories).values(defaultCategories);
  }
}

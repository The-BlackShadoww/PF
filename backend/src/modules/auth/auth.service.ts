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
import { DB_TOKEN, type DrizzleDB } from '../../db/db.constants';
import { refreshTokens, users } from '../../db/schema';
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
}

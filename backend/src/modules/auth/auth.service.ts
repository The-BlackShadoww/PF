import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { and, eq, isNull } from 'drizzle-orm';
import { DB_TOKEN, type DrizzleDB } from '../../db/db.constants';
import { users } from '../../db/schema';
import { RegisterDto } from './dto/register.dto';

export type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

@Injectable()
export class AuthService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

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
}

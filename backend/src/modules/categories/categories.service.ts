import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { DB_TOKEN, type DrizzleDB } from '../../db/db.constants';
import { categories } from '../../db/schema';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  findAll(userId: string) {
    return this.db
      .select()
      .from(categories)
      .where(and(eq(categories.userId, userId), isNull(categories.deletedAt)))
      .orderBy(asc(categories.type), asc(categories.sortOrder));
  }
}

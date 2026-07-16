import { Inject, Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { DB_TOKEN, type DrizzleDB } from '../../db/db.constants';
import { categories } from '../../db/schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

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

  async create(userId: string, dto: CreateCategoryDto) {
    const [newCategory] = await this.db
      .insert(categories)
      .values({
        userId,
        name: dto.name,
        type: dto.type,
        color: dto.color,
        icon: dto.icon,
        sortOrder: dto.sortOrder,
      })
      .returning();

    return newCategory;
  }

  async update(userId: string, id: string, dto: UpdateCategoryDto) {
    const [existing] = await this.db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, id),
          eq(categories.userId, userId),
          isNull(categories.deletedAt)
        )
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    const [updated] = await this.db
      .update(categories)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return updated;
  }

  async remove(userId: string, id: string) {
    const [existing] = await this.db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, id),
          eq(categories.userId, userId),
          isNull(categories.deletedAt)
        )
      )
      .limit(1);

    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    if (existing.isDefault) {
      throw new ConflictException('Cannot delete a default category');
    }

    const [deleted] = await this.db
      .update(categories)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    return deleted;
  }
}

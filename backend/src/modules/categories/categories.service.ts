import { Injectable, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { eq, and, isNull, asc } from 'drizzle-orm';
import { DB_TOKEN } from '../../db/db.constants';
import type { DrizzleDB } from '../../db/db.constants';
import { categories } from '../../db/schema/index';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(@Inject(DB_TOKEN) private readonly db: DrizzleDB) {}

  async findAll(userId: string) {
    return this.db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          isNull(categories.deletedAt),
        )
      )
      .orderBy(
        asc(categories.type),
        asc(categories.sortOrder),
        asc(categories.name),
      );
  }

  private async findOneOwned(userId: string, categoryId: string) {
    const [category] = await this.db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, categoryId),
          eq(categories.userId, userId),
          isNull(categories.deletedAt),
        )
      )
      .limit(1);

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async create(userId: string, dto: CreateCategoryDto) {
    const [existing] = await this.db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.name, dto.name),
          eq(categories.type, dto.type),
          isNull(categories.deletedAt),
        )
      )
      .limit(1);

    if (existing) {
      throw new BadRequestException(
        `A ${dto.type} category named "${dto.name}" already exists`
      );
    }

    const [created] = await this.db
      .insert(categories)
      .values({
        userId,
        name: dto.name,
        type: dto.type,
        color: dto.color ?? '#6b7280',
        icon: dto.icon ?? 'tag',
        sortOrder: dto.sortOrder ?? 0,
        isDefault: false,
      })
      .returning();

    return created;
  }

  async update(userId: string, categoryId: string, dto: UpdateCategoryDto) {
    const category = await this.findOneOwned(userId, categoryId);

    if (dto.name && dto.name !== category.name) {
      const [duplicate] = await this.db
        .select({ id: categories.id })
        .from(categories)
        .where(
          and(
            eq(categories.userId, userId),
            eq(categories.name, dto.name),
            eq(categories.type, category.type),
            isNull(categories.deletedAt),
          )
        )
        .limit(1);

      if (duplicate) {
        throw new BadRequestException(
          `A ${category.type} category named "${dto.name}" already exists`
        );
      }
    }

    const [updated] = await this.db
      .update(categories)
      .set({
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
        updatedAt: new Date(),
      })
      .where(eq(categories.id, categoryId))
      .returning();

    return updated;
  }

  async remove(userId: string, categoryId: string): Promise<{ success: boolean }> {
    const category = await this.findOneOwned(userId, categoryId);

    if (category.isDefault) {
      throw new ForbiddenException(
        'Default categories cannot be deleted. You can rename or recolor them instead.'
      );
    }

    await this.db
      .update(categories)
      .set({ deletedAt: new Date() })
      .where(eq(categories.id, categoryId));

    return { success: true };
  }
}
